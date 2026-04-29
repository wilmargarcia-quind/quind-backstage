const GITHUB_ORG = process.env.GITHUB_ORG ?? "quind"

interface GitHubTeam {
  slug: string
  organization: {
    login: string
  }
}

export async function fetchUserTeams(accessToken: string): Promise<string[]> {
  try {
    const response = await fetch("https://api.github.com/user/teams", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/vnd.github.v3+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
    })

    if (!response.ok) {
      return []
    }

    const teams: GitHubTeam[] = await response.json()

    return teams
      .filter(
        (team) =>
          team.organization.login.toLowerCase() === GITHUB_ORG.toLowerCase()
      )
      .map((team) => `${team.organization.login}/${team.slug}`)
  } catch {
    return []
  }
}
