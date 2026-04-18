# Arkanoid: Revenge of the Dope

A browser-based Arkanoid tribute project with custom arcade presentation, title video support, soundtrack playback, multiple stages, a Doh-style boss, and local project rules tracked in [`AGENTS.md`](./AGENTS.md).

## Play Online

Play the current GitHub Pages build here:

[Play Arkanoid: Revenge of the Dope](https://shadow2442.github.io/Arkanoid-Revenge-of-the-Dope/)

## Preview

<table>
  <tr>
    <td align="center" valign="top">
      <details>
        <summary><img src="./website/assets/readme/title-preview.gif" alt="Title screen preview" width="360" /></summary>
        <img src="./website/assets/readme/title-preview.gif" alt="Title screen preview" width="720" />
      </details>
    </td>
    <td align="center" valign="top">
      <details>
        <summary><img src="./website/assets/readme/gameplay-preview.png" alt="Gameplay preview" width="360" /></summary>
        <img src="./website/assets/readme/gameplay-preview.png" alt="Gameplay preview" width="720" />
      </details>
    </td>
  </tr>
</table>

Click either preview to expand it, and click again to collapse it.

## Highlights

- Playable browser build with arcade-style presentation
- Three handcrafted stages plus a Doh-inspired boss encounter
- Custom title video, soundtrack support, and retro UI effects
- Mouse and keyboard controls
- GitHub Pages deployment from the `website/` folder via Actions

## Controls

- `A` / `D` or `Left` / `Right`: move Vaus
- `Space` / `Enter`: launch ball and confirm menu choices
- `Left Click`: start game from title screen
- `Left Click` during laser power-up: fire lasers / hold for autofire
- `F`: fire lasers during laser power-up
- `P`: pause and resume
- `Esc`: open the return-to-title confirmation prompt

## Project Structure

- `website/`
  - Live web build files for the playable game
  - Includes `index.html`, `styles.css`, `game.js`, runtime assets, video, and soundtrack files
- `tools/`
  - Helper scripts for local workflow
- `AGENTS.md`
  - Project-specific working rules for Codex

## Run Locally

Open the live build from:

`website/index.html`

If you want a quick local launcher in Chrome, use:

`tools/open-local-in-chrome.ps1`

## Publishing Notes

- The playable GitHub Pages site is live at:
  - [https://shadow2442.github.io/Arkanoid-Revenge-of-the-Dope/](https://shadow2442.github.io/Arkanoid-Revenge-of-the-Dope/)
- The live build files are published from the `website/` folder through GitHub Actions
- Before future publishing changes, verify asset paths, audio/video references, and title-screen behavior

## Current Runtime Assets

- Main game logic: `website/game.js`
- Main page: `website/index.html`
- Styles: `website/styles.css`
- Title video: `website/assets/video/title-screen.mp4`
- README preview GIF: `website/assets/readme/title-preview.gif`
- README gameplay screenshot: `website/assets/readme/gameplay-preview.png`
- Music: `website/soundtrack/`

## License

This project is released under [The Unlicense](./LICENSE).

That means anyone can use it, modify it, distribute it, remix it, and include it in other work with essentially no restrictions.

## Development Notes

- Keep the root folder minimal
- Keep public runtime files inside `website/`
- Avoid mixing internal project material into the public game area unless intentionally shipped
