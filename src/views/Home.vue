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
      <p>Hi, I'm Luis Armada! I live in London 🇬🇧 and work at FVC as a quantitative developer.</p>
      <p>I graduated from the University of Warwick with a BSc in Computer Science, where I built a foundation in software engineering and systems thinking. You can read more about my background on my <router-link to="/profile">profile</router-link>.</p>
      <p>I've loved building things and picking up new skills since I first got my hands on a computer 💻 — find some of my <router-link to="/projects">projects</router-link> and <router-link to="/posts">posts</router-link> here.</p>
      <p>Outside of work, I enjoy climbing 🧗, playing and developing video games, playing the guitar 🎸, and <router-link to="/photos">taking pictures</router-link>.</p>
      <p>Feel free to reach out at <a href="mailto:luisarmada@hey.com">luisarmada@hey.com</a>.</p>
      <p>Find me at some of my other links below.</p>
    </div>
  </div>
</template>

<style scoped>
.bio-wrapper {
  width: var(--page-width);
  margin-top: 0.5rem;
}

.bio-wrapper::after {
  content: '';
  display: table;
  clear: both;
}

.bio {
  padding-top: 2rem;
}

.ascii {
  float: left;
  margin: 0 1.5rem 0.5rem 0;
  font-family: monospace;
  font-size: 1rem;
  line-height: 1.2;
  color: #555;
}

.bio p {
  font-size: 1rem;
  color: #333;
  line-height: 1.6;
  margin-bottom: 0.6rem;
}

.bio p:last-child {
  margin-bottom: 0;
}

.bio a {
  color: #000;
  font-weight: 500;
  text-decoration: underline;
  text-decoration-color: rgba(0, 0, 0, 0.35);
  text-underline-offset: 5px;
}

.bio a:hover {
  text-decoration-color: rgba(0, 0, 0, 0.7);
}

@media (max-width: 480px) {
  .ascii {
    float: none;
    display: block;
    margin: 0 0 1rem 0;
    font-size: 0.7rem;
  }
}
</style>
