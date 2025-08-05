# Automated Versioning

This project uses [semantic-release](https://semantic-release.gitbook.io/semantic-release/) for automated versioning and releases.

## How It Works

Versions are automatically generated based on commit messages using [Conventional Commits](https://www.conventionalcommits.org/):

### Commit Message Format

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Version Bumps

- **PATCH** (1.0.0 → 1.0.1): `fix:` commits
- **MINOR** (1.0.0 → 1.1.0): `feat:` commits
- **MAJOR** (1.0.0 → 2.0.0): `BREAKING CHANGE:` in footer or `!` after type

### Examples

```bash
fix: resolve CSRF token validation issue          # → 1.0.1
feat: add user authentication system              # → 1.1.0
feat!: redesign API with breaking changes         # → 2.0.0
```

## Release Process

1. **Automatic**: Push to `main` branch triggers GitHub Actions
2. **Manual**: Run `npm run release` (requires GitHub token)
3. **Test**: Run `npm run release:dry-run` to preview changes

## Generated Assets

Each release automatically creates:

- ✅ **CHANGELOG.md** - Release notes
- ✅ **GitHub Release** - With release notes
- ✅ **Git Tags** - Semantic version tags
- ✅ **NPM Version** - Updated package.json

## Security Integration

The release workflow includes all security checks:

- 🔒 Security vulnerability scan
- 🧪 Test suite execution
- 📝 TypeScript validation
- 🎨 Code linting
- 🏗️ Build verification

## Commit Types

| Type       | Description             | Version Bump |
| ---------- | ----------------------- | ------------ |
| `feat`     | New feature             | Minor        |
| `fix`      | Bug fix                 | Patch        |
| `docs`     | Documentation           | None         |
| `style`    | Code formatting         | None         |
| `refactor` | Code restructuring      | None         |
| `test`     | Test additions          | None         |
| `chore`    | Maintenance             | None         |
| `perf`     | Performance improvement | Patch        |
| `build`    | Build system changes    | None         |
| `ci`       | CI configuration        | None         |

## First Release

Your next commit with `feat:` or `fix:` will trigger the first automated release (v1.0.0).
