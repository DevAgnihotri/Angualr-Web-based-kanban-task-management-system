---

### 🔹 Step 1. Initialize Git in your project folder

If not already:

```bash
git init
```

---

### 🔹 Step 2. Link your local repo to GitHub (remote)

Then run:

```bash
git remote add origin https://github.com/Springboard-Internship-2025/Web-Based-Kanban-Task-Manager-with-Drag-and-Drop-Functionality_September_2025
```

Check if it’s linked:

```bash
git remote -v
```

---

### 🔹 Step 3. Create & switch to your branch

Branch names usually don’t take spaces — use underscore `_` or hyphen `-`.
Based on our name,
Like my name is Dev Agnihotri so I'll go with `Dev_Agnihotri`

```bash
git checkout -b Dev_Agnihotri
```

Now you are **inside the new branch**.

---

### 🔹 Step 4. Add your changes

After editing files:

```bash
git add .
```

---

### 🔹 Step 5. Commit your changes

```bash
git commit -m "Initial commit on Dev_Agnihotri branch"
```

---

### 🔹 Step 6. Push the branch to GitHub

```bash
git push -u origin Dev_Agnihotri
```

(`-u` sets upstream, so later you can just do `git push` without writing branch name again.)

---

✅ Now your branch `Dev_Agnihotri` will be visible on GitHub.
You can continue working, commit & just run:

```bash
git push
```