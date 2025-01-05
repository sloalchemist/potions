# Contribution Standards

The following standards must be met for any pull request (PR) to be accepted into the repository.

## Code Review
- Every PR must be reviewed and approved by your group before merging.
- Peer review ensures quality and shared understanding of the changes.

## Atomic Pull Requests
- Each PR should address a single, cohesive change.
- Avoid combining refactors, new features, or unrelated fixes in one PR. If changes are interdependent, communicate this clearly in the PR description.

## Code Hygiene
- Leave the codebase better than you found it. If you encounter substandard code in areas you are working on, refactor or improve it within reason.
- Follow clean code principles:
  - Write clear and self-explanatory variable, function, and class names.
  - Use single-responsibility functions or classes to make code easier to understand and test.
  - Avoid "magic numbers" or hardcoded values; use constants or enums instead.
  - Ensure proper error handling and avoid silent failures. Failing fast makes bugs obvious.

## Documentation Parity
- Update relevant documentation alongside your code changes to ensure alignment between the codebase and its documentation.
- This includes README files, API documentation, inline comments, and any related guides.

## Commit Standards
- Use semantic and descriptive commit messages (e.g., `feat: add user authentication` or `fix: resolve login bug`).
- Follow the [Conventional Commits](https://www.conventionalcommits.org/) format.

## Continuous Integration Validation
- All PRs must pass automated CI checks, including tests, linting, and build validation, before merging.

## No Dogma Policy
- These rules aren't special. This is a social agreement for developers to work together.
- Everyone is responsible for questioning and improving these standards as a group so that we function better.
