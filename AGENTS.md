# Project notes (AGENTS.md)

This file is auto-loaded into the agent's context for this project.

<!-- opencode:github-workspace (written by the app; edit freely OUTSIDE this block) -->
## GitHub workspace rules (from the OpenCode Android app)

This project IS a GitHub working copy, and the remote repository is its
primary workspace - this device folder is a temporary place to work.
A change that is not pushed does not, for practical purposes, exist.

- Commit AND push after EVERY logical change, starting with the very first
  one, even an edit made in response to the user's opening prompt. Never
  wait to be asked, never batch work "until the end".
- Stay on the current branch (the project branch the app checked out);
  no extra branches unless the user asks.
- Push with the token URL the environment brief's GitHub section provides;
  `git remote get-url origin` names the owner/repo. Never print the token,
  never commit it into any file.
- Anything else the user asks about this repo happens ON GitHub - the repo,
  not only the sandbox.
<!-- opencode:github-workspace:end -->
