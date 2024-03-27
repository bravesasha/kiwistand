//@format
import htm from "htm";
import vhtml from "vhtml";

import Header from "./components/header.mjs";
import Sidebar from "./components/sidebar.mjs";
import Footer from "./components/footer.mjs";
import Head from "./components/head.mjs";

const html = htm.bind(vhtml);

const path = "/indexing";

export default async function (theme, userAddress, transactionHash) {
  return html`
    <html lang="en" op="news">
      <head>
        ${Head}
        <style>
          @media screen and (min-width: 769px) {
            .sidebar {
              display: none;
            }
          }
          .sidebar-toggle {
            visibility: hidden;
          }
          #hnmain {
            width: 100%;
            border-bottom: none;
          }
        </style>
      </head>
      <body>
        <div class="container">
          ${Sidebar()}
          <div id="hnmain">
            <table border="0" cellpadding="0" cellspacing="0" bgcolor="#f6f6ef">
              <tr>
                ${await Header(theme, path)}
              </tr>
              <tr>
                <td>
                  <div
                    style="height: 60vh; flex-direction: column; display: flex; justify-content: center; align-items: center;"
                  >
                    <img
                      style="max-width: 65vw; overflow: auto; margin-top: 4rem;"
                      src="Telegram.png"
                    />
                    <div
                      style="display: flex; justify-content: center; flex-direction: column; max-width: 20rem;"
                    >
                      <h2 style="color: black;">
                        Share and discuss content with fellow crypto builders
                      </h2>
                      <p>
                        Discuss the content, project and anything you’d like to
                        chat about on our Telegram Channel. Join us and say gm!
                      </p>
                      <nav-invite-link> ...loading </nav-invite-link>
                    </div>
                  </div>
                </td>
              </tr>
              <tr>
                <td>
                  <p
                    style="color: black; padding: 1rem 3rem 1rem 3rem; font-size: 1rem; text-align: center; margin-top: 1rem;"
                  >
                    Your next step:
                  </p>
                </td>
              </tr>
              <tr>
                <td
                  style="padding: 0 0 3rem 0; display: flex; justify-content: space-evenly;"
                >
                  <nav-push-notification-redirector>
                    <a href="/demonstration">
                      <button
                        style="width:auto;"
                        class="button-secondary"
                        id="button-onboarding"
                      >
                        Upvote your first story!
                      </button>
                    </a>
                  </nav-push-notification-redirector>
                </td>
              </tr>
            </table>
          </div>
        </div>
        <div style="display: none;">${Footer(theme, "/invite")}</div>
      </body>
    </html>
  `;
}
