<template>
  <div class="bio-wrapper">
    <pre class="ascii">⠀⠀⠀⠀⠀⢀⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⢰⣿⡿⠗⠀⠠⠄⡀⠀⠀⠀⠀
⠀⠀⠀⠀⡜⠁⠀⠀⠀⠀⠀⠈⠑⢶⣶⡄
⢀⣶⣦⣸⠀⢼⣟⡇⠀⠀⢀⣀⠀⠘⡿⠃
⠀⢿⣿⣿⣄⠒⠀⠠⢶⡂⢫⣿⢇⢀⠃⠀
⠀⠈⠻⣿⣿⣿⣶⣤⣀⣀⣀⣂⡠⠊⠀⠀
⠀⠀⠀⠃⠀⠀⠉⠙⠛⠿⣿⣿⣧⠀⠀⠀
⠀⠀⠘⡀⠀⠀⠀⠀⠀⠀⠘⣿⣿⡇⠀⠀
⠀⠀⠀⣷⣄⡀⠀⠀⠀⢀⣴⡟⠿⠃⠀⠀
⠀⠀⠀⢻⣿⣿⠉⠉⢹⣿⣿⠁⠀⠀⠀⠀
⠀⠀⠀⠀⠉⠁⠀⠀⠀⠉⠁⠀⠀⠀⠀⠀</pre>
    <div class="bio">
      <p>Hi! I'm Luis Armada. I live in London, and I work at FVC as a quantitative developer.</p>
      <p>Feel free to reach out at <a href="mailto:luisarmada@hey.com">luisarmada@hey.com</a>.</p>
    </div>
  </div>
</template>

<style scoped>
.bio-wrapper {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  width: var(--page-width);
  margin-top: 1rem;
}

.ascii {
  font-family: monospace;
  font-size: 1rem;
  line-height: 1.2;
  color: #555;
  flex-shrink: 0;
}

.bio {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.bio p {
  font-size: 1rem;
  color: #333;
  line-height: 1.6;
}

.bio a {
  color: #000;
  text-decoration: underline;
  text-decoration-color: rgba(0, 0, 0, 0.35);
}

.bio a:hover {
  text-decoration-color: rgba(0, 0, 0, 0.7);
}

@media (max-width: 480px) {
  .bio-wrapper {
    flex-direction: column;
    align-items: flex-start;
  }

  .ascii {
    font-size: 0.7rem;
  }
}
</style>
