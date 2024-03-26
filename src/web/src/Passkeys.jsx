import React, { useState, useEffect } from "react";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { WagmiConfig, useAccount } from "wagmi";
import { Wallet } from "@ethersproject/wallet";
import { eligible } from "@attestate/delegator2";

import { PasskeysSVG } from "./icons.jsx";
import { useProvider, client, chains } from "./client.mjs";
import { ProgressBar } from "./DelegateButton.jsx";
import { getLocalAccount } from "./session.mjs";

export const rp = {
  name: "Kiwi News",
  id: window.location.hostname,
};

export const truncate = (address) =>
  address.slice(0, 6) +
  "..." +
  address.slice(address.length - 4, address.length);

const testFeature = async () =>
  window.PublicKeyCredential &&
  PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable &&
  PublicKeyCredential.isConditionalMediationAvailable &&
  (await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()) &&
  (await PublicKeyCredential.isConditionalMediationAvailable());

export const toBuffer = (data) => {
  return new TextEncoder().encode(data).buffer;
};

export const RestoreDialogue = (allowlist, delegations, toast) => {
  return () => {
    const provider = useProvider();
    const [featureAvailable, setFeatureAvailable] = useState(false);
    useEffect(() => {
      (async () => {
        const isAvailable = await testFeature();
        setFeatureAvailable(isAvailable);
      })();
    });

    async function read() {
      const options = {
        publicKey: {
          challenge: genVal(),
          rp,
          userVerification: "discouraged",
          extensions: {
            largeBlob: {
              read: true,
            },
          },
        },
      };

      let assertion;
      try {
        assertion = await navigator.credentials.get(options);
      } catch (err) {
        toast.error(`Error reading large blob: ${err.toString()}`);
        return;
      }
      const largeBlobData = assertion.getClientExtensionResults().largeBlob;
      const textDecoder = new TextDecoder();
      const decodedData = textDecoder.decode(largeBlobData.blob);
      if (!decodedData) {
        toast.error(
          `Error decoding blob data. This is the decoded data: "${decodedData}"`,
        );
        return;
      }
      const wallet = new Wallet(decodedData, provider);
      const identity = eligible(allowlist, delegations, wallet.address);
      localStorage.setItem(`-kiwi-news-${identity}-key`, decodedData);
      location.reload();
    }

    if (!featureAvailable || window.location.pathname === "/settings")
      return null;
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          flexDirection: "column",
        }}
      >
        <button
          onClick={read}
          id="button-onboarding"
          style={{
            width: "auto",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            fontWeight: 600,
            fontSize: "15px",
            gap: "4px",
            border: "1px solid #828282",
            borderRadius: "2px",
            padding: "0 0.75rem",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <PasskeysSVG style={{ width: "28px" }} /> Connect with Passkeys
        </button>
        <p style={{ color: "black" }}>
          "Connect with Passkeys" is a Kiwi-specific feature that will only work
          if you've previously backed up your key on the Settings page
        </p>
      </div>
    );
  };
};

async function generateUserId(address1, address2) {
  const encoder = new TextEncoder();
  const data = encoder.encode(address1 + address2);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return new Uint8Array(hashBuffer);
}

export const genVal = (size = 32) => {
  const randomValues = new Uint8Array(size);
  window.crypto.getRandomValues(randomValues);
  return randomValues;
};

const Dialogue = (props) => {
  return (
    <div>
      <h3
        style={{
          marginTop: "0",
          fontSize: "1.2rem",
          color: "black",
          marginBottom: "20px",
        }}
      >
        <span>Backup with Passkeys</span>
      </h3>
      <p
        style={{
          fontWeight: "bold",
          color: "black",
          marginBottom: "20px",
          textAlign: "left",
        }}
      >
        Securely store your upvote key with Passkeys for multi-device access:
      </p>
      <ul
        style={{
          textAlign: "left",
          listStyle: "none",
          paddingLeft: "0",
          color: "black",
          marginBottom: "10px",
        }}
      >
        <li>
          <span style={{ color: "limegreen" }}>•</span> Encrypted storage on
          iCloud.
        </li>
        <li style={{ marginTop: "5px" }}>
          <span style={{ color: "limegreen" }}>•</span> Your wallet's custody
          key remains on your device.
        </li>
      </ul>
    </div>
  );
};

function BackupKey() {
  const [rawId, setRawId] = useState(null);
  const [lbResult, setLbResult] = useState(null);
  const [progress, setProgress] = useState(1);
  const [featureAvailable, setFeatureAvailable] = useState(false);
  useEffect(() => {
    (async () => {
      const isAvailable = await testFeature();
      setFeatureAvailable(isAvailable);
    })();
  });

  let address;
  const account = useAccount();
  const localAccount = getLocalAccount(account.address);
  if (account.isConnected) {
    address = account.address;
  }
  if (localAccount) {
    address = localAccount.identity;
  }

  async function create() {
    const id = await generateUserId(localAccount.identity, localAccount.signer);
    const publicKey = {
      challenge: genVal(),
      rp,
      user: {
        id,
        name: `Kiwi Wallet ${new Date().toLocaleDateString()} ${truncate(
          localAccount.identity,
        )}`,
        displayName: `Kiwi Wallet ${new Date().toLocaleDateString()} ${truncate(
          localAccount.identity,
        )}`,
      },
      pubKeyCredParams: [{ alg: -7, type: "public-key" }],
      authenticatorSelection: {
        userVerification: "required",
        residentKey: "preferred",
      },
      extensions: {
        largeBlob: {
          support: "required",
        },
      },
    };
    let newCredential;
    try {
      newCredential = await navigator.credentials.create({ publicKey });
    } catch (err) {
      props.toast.error(
        `Error while creating the credential ${err.toString()}`,
      );
      console.log(err);
      return;
    }
    setRawId(newCredential.rawId);
    setProgress(2);
  }

  const store = async () => {
    const write = new TextEncoder().encode(localAccount.privateKey);
    const options = {
      challenge: genVal(),
      rp,
      userVerification: "discouraged",
      allowCredentials: [
        {
          type: "public-key",
          id: rawId,
        },
      ],
      extensions: {
        largeBlob: {
          write,
        },
      },
    };

    let assertion;
    try {
      assertion = await navigator.credentials.get({ publicKey: options });
    } catch (err) {
      console.log(err);
      props.toast.error(`Error while storing the credential ${err.toString()}`);
      return;
    }
    if (assertion.getClientExtensionResults()?.largeBlob?.written) {
      setLbResult("Backup successful!");
    } else {
      setLbResult("Backup failed!");
    }
    setProgress(3);
  };

  if (!account.isConnected || !address || !localAccount || !featureAvailable)
    return null;
  if (lbResult && lbResult.includes("successful")) {
    return (
      <div>
        <ProgressBar progress={progress} />
        <h3
          style={{
            marginTop: "0",
            fontSize: "1.2rem",
            color: "black",
            marginBottom: "20px",
          }}
        >
          <span>Backup successful!</span>
        </h3>
        <p
          style={{
            fontWeight: "bold",
            color: "black",
            marginBottom: "20px",
            textAlign: "left",
          }}
        >
          Next time you connect your wallet, look out for the "Connect with
          Passkeys" button!
          <br />
          <br />
          <button
            id="button-onboarding"
            style={{
              display: "flex",
              alignItems: "center",
              width: "auto",
              padding: "0.2rem 0.5rem",
            }}
          >
            <PasskeysSVG style={{ width: "32px" }} /> Connect with Passkeys
          </button>
        </p>
      </div>
    );
  } else if (lbResult) {
    props.toast.error(
      "Something went wrong when storing your passkey. Please contact @timdaub",
    );
    return (
      <span style={{ color: "black", fontWeight: "bold" }}>{lbResult}</span>
    );
  }

  return (
    <div>
      {!rawId ? (
        <div>
          <ProgressBar progress={progress} />
          <span>
            <Dialogue />
            <button
              style={{ width: "auto" }}
              id="button-onboarding"
              onClick={create}
            >
              Create Passkey
            </button>
          </span>
        </div>
      ) : (
        <div>
          <ProgressBar progress={progress} />
          <span>
            <Dialogue />
            <button
              style={{ width: "auto" }}
              id="button-onboarding"
              onClick={store}
            >
              Backup key
            </button>
          </span>
        </div>
      )}
    </div>
  );
}

const Form = (props) => {
  return (
    <WagmiConfig config={client}>
      <RainbowKitProvider chains={chains}>
        <BackupKey />
      </RainbowKitProvider>
    </WagmiConfig>
  );
};

export default Form;
