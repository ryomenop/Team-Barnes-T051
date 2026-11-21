const git = require('isomorphic-git');
const http = require('isomorphic-git/http/node');
const fs = require('fs');

const repoDir = __dirname;
const remoteUrl = 'https://github.com/ryomenop/Team-Barnes-T051.git';
const token = process.argv[2] || process.env.GITHUB_TOKEN;

async function push() {
  if (!token) {
    console.log('ERROR: GITHUB_TOKEN_REQUIRED');
    console.log('Usage: node gitPush.cjs <YOUR_GITHUB_PERSONAL_ACCESS_TOKEN>');
    process.exit(1);
  }

  console.log('1. Preparing Git repository in:', repoDir);
  await git.init({ fs, dir: repoDir, defaultBranch: 'main' });

  console.log('2. Staging all project files...');
  const statusMatrix = await git.statusMatrix({ fs, dir: repoDir });
  for (const [filepath, head, workdir, stage] of statusMatrix) {
    if (filepath === 'gitPush.cjs') continue;
    if (workdir === 0) {
      await git.remove({ fs, dir: repoDir, filepath });
    } else {
      await git.add({ fs, dir: repoDir, filepath });
    }
  }

  console.log('3. Creating commit...');
  let sha;
  try {
    sha = await git.commit({
      fs,
      dir: repoDir,
      message: 'CampusCare: University Grievance Redressal & Maintenance System (Netlify Ready)',
      author: {
        name: 'ryomenop',
        email: 'admin@campuscare.edu'
      }
    });
    console.log('Committed SHA:', sha);
  } catch (commitErr) {
    console.log('Commit note:', commitErr.message);
  }

  console.log('4. Pushing to GitHub (https://github.com/ryomenop/Team-Barnes-T051.git)...');
  const result = await git.push({
    fs,
    http,
    dir: repoDir,
    remote: 'origin',
    url: remoteUrl,
    ref: 'main',
    force: true,
    onAuth: () => ({ username: token, password: '' })
  });

  if (result.ok) {
    console.log('SUCCESS: All files successfully pushed to https://github.com/ryomenop/Team-Barnes-T051.git (branch: main)');
  } else {
    console.log('Push response:', JSON.stringify(result, null, 2));
  }
}

push().catch((err) => {
  console.error('PUSH_FAILED:', err.message);
  if (err.data && err.data.response) {
    console.error('Server response:', err.data.response);
  }
  process.exit(1);
});
