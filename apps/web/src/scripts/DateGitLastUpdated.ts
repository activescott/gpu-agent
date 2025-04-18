import { spawnSync } from "child_process"

/* Thank you to Vuepress!
 * https://github.com/vuejs/vuepress/blob/89440ce552675859189ed4ab254ce19c4bba5447/packages/%40vuepress/plugin-last-updated/index.js
 * MIT licensed: https://github.com/vuejs/vuepress/blob/89440ce552675859189ed4ab254ce19c4bba5447/LICENSE
 */
function getGitLastUpdatedTimeStamp(filePath: string) {
  const MS = 1000
  return (
    Number.parseInt(
      spawnSync(
        "git",
        // Formats https://www.git-scm.com/docs/git-log#_pretty_formats
        // %at author date, UNIX timestamp
        ["log", "-1", "--format=%at", filePath],
      ).stdout.toString("utf8"),
    ) * MS
  )
}

// return a Date
export default function (inputPath: string) {
  const timestamp = getGitLastUpdatedTimeStamp(inputPath)
  if (timestamp) {
    return new Date(timestamp)
  }
}
