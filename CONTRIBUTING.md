# Contributing Guide

## Branching & PR Workflow (2 Devs)

### Rules
- **Never commit directly to `main`.**
- Use **short‑lived feature branches** (1–3 days).
- **Rebase** your branch on latest `main` before opening/merging PRs.
- Keep PRs **small and focused**.

---

## Daily Flow

```bash
# Sync main
git checkout main
git pull origin main

# Update your branch
git checkout ayhan
git fetch origin
git rebase origin/main
```


## Start a New Feature

```bash
git checkout main
git pull origin main
git checkout -b <your-branch>
```

---

## Push & PR

```bash
git push -u origin <your-branch>
```

Open a PR and choose **Rebase & merge**.

---

## After PR Merge

```bash
git checkout main
git pull origin main
```

Optionally delete the branch:

```bash
git branch -d <your-branch>
git push origin --delete <your-branch>
```

---

## Conflict Reduction Tips

- Split work by folders when possible:
  - Dev A: `admin-panel/**`
  - Dev B: `src/**`
- Rebase **daily** to resolve conflicts early.
- Avoid touching the same files at the same time.
