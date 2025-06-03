## Contributing

[fork]: https://github.com/github/startups-content/fork
[pr]: https://github.com/github/startups-content/compare
[code-of-conduct]: CODE_OF_CONDUCT.md

Hi there! We're thrilled that you'd like to contribute to this project. Your help is essential for keeping it great.

Contributions to this project are [released](https://help.github.com/articles/github-terms-of-service/#6-contributions-under-repository-license) to the public under the [project's open source license](LICENSE.md).

Please note that this project is released with a [Contributor Code of Conduct][code-of-conduct]. By participating in this project you agree to abide by its terms.

## Prerequisites for running and testing code

These are one time installations required to be able to test your changes locally as part of the pull request (PR) submission process.

1. Python 3.13 or later
2. Node.js 22 or later  
3. Git

The repository includes setup scripts to handle dependency installation automatically.

## Submitting a pull request

1. [Fork][fork] and clone the repository
2. Make your change following our [coding standards](.github/copilot-instructions.md)
3. Run tests and linting checks locally:
   - Backend tests: `bash ./scripts/run-server-tests.sh`
   - Frontend tests: `cd client && npm run test:e2e`
   - Linting: See automated formatting section below
4. Push to your fork and [submit a pull request][pr]
5. Pat your self on the back and wait for your pull request to be reviewed and merged.

- Keep your change as focused as possible. If there are multiple changes you would like to make that are not dependent upon each other, consider submitting them as separate pull requests.
- Write a [good commit message](http://tbaggery.com/2008/04/19/a-note-about-git-commit-messages.html).
- Follow the coding standards detailed in our [custom instructions](.github/copilot-instructions.md).

## Automated Formatting and Linting

This project uses automated tools to maintain code quality and consistency:

### Python Code Quality Tools
- **Black**: Code formatter with 88-character line length
- **isort**: Import statement organizer  
- **flake8**: Style guide enforcement
- **mypy**: Static type checking

### Running Locally
```bash
# Install dependencies
bash ./scripts/setup-env.sh

# Format code (run before committing)
source venv/bin/activate
black server/
isort server/

# Check formatting and linting (what CI runs)
black --check server/
isort --check-only server/  
flake8 server/
mypy server/ --ignore-missing-imports
```

### Editor Integration
The repository includes an `.editorconfig` file for consistent formatting across editors. Most modern editors will automatically apply these settings.

## Resources

- [How to Contribute to Open Source](https://opensource.guide/how-to-contribute/)
- [Using Pull Requests](https://help.github.com/articles/about-pull-requests/)
- [GitHub Help](https://help.github.com)