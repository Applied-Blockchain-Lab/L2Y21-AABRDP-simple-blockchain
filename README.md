# L2Y21-AABRDP-simple-blockchain

## Rules of repo

### Branching strategy

We use GitHub Flow.

### Commit message format

Our convention for commit messages:

```text
feat: Add beta sequence
^--^ ^---------------^
| |
| +-> Summary in present tense.
|
+-------> Type: chore, docs, feat, fix, refactor, style, or test.
```

We use tools: [Commitlint](https://commitlint.js.org/#/) and [Husky](https://github.com/typicode/husky).

### Convention for code

For this purpose we use [ESLint AirBnb](https://github.com/airbnb/javascript/tree/master/packages/eslint-config-airbnb) style guide.
[Why Use AirBnB’s ESLint Configuration? A Review of AirBnB’s Rules List](https://smartdevpreneur.com/why-use-airbnbs-eslint-config-a-review-of-airbnbs-rules-list/).

## How to use after clone (make sure to clone 'main' branch)

1. Install packages

```sh
npm install
```

2. Run

    ```sh
    npm start
    ```

For testing API endpoinst go to **/api-docs**. We use [Swagger](https://swagger.io/tools/swagger-ui/).
For code documentation run **docs/index.html**. We use [ESDoc](https://esdoc.org/).

3. Test

    ```sh
    npm test
    ```

4. Before commit ESLint will check your code and problems will come out if there are any. However, you can check or fix your code at any time with:

    - ESLint check:

    ```sh
    npm run lint
    ```

    - ESLint fix:

    ```sh
    npm run lint-fix
    ```
