// Еталони завдань курсу HTML, глава 04 (id завдання -> повний код). У сайт не потрапляють.
export const SOLUTIONS_04 = {
  "html-media": `<!DOCTYPE html>
<html lang="uk">
<head><meta charset="utf-8"><title>Галерея</title></head>
<body>
  <h1>Галерея</h1>
  <img src="photo1.jpg" alt="Світанок над озером" width="400" height="300">
  <img src="photo2.jpg" alt="Гірська стежка" width="400" height="300" loading="lazy">
  <img src="photo3.jpg" alt="Вечірнє місто з даху" width="400" height="300" loading="lazy">
  <img src="divider.png" alt="">
  <p>Кінець галереї</p>
</body>
</html>
`,
  "html-figure-picture": `<!DOCTYPE html>
<html lang="uk">
<head><meta charset="utf-8"><title>Банер</title></head>
<body>
  <figure>
    <picture>
      <source media="(min-width: 800px)" srcset="banner-wide.webp" type="image/webp">
      <source srcset="banner-narrow.webp" type="image/webp">
      <img src="banner-narrow.jpg" alt="Весняний розпродаж у магазині" width="800" height="300">
    </picture>
    <figcaption>Весняний розпродаж</figcaption>
  </figure>
  <img src="lake-800.jpg" srcset="lake-480.jpg 480w, lake-800.jpg 800w, lake-1600.jpg 1600w" sizes="(max-width: 600px) 100vw, 50vw" alt="Гірське озеро" width="800" height="533">
</body>
</html>
`,
  "html-audio-video": `<!DOCTYPE html>
<html lang="uk">
<head><meta charset="utf-8"><title>Медіа</title></head>
<body>
  <h1>Медіа</h1>
  <video controls poster="cover.jpg" width="640" height="360">
    <source src="clip.mp4" type="video/mp4">
    <source src="clip.webm" type="video/webm">
    <track kind="subtitles" src="uk.vtt" srclang="uk" label="Українська">
    <p>Відео не підтримується. <a href="clip.mp4">Завантажити</a>.</p>
  </video>
  <audio controls preload="none">
    <source src="song.mp3" type="audio/mpeg">
  </audio>
</body>
</html>
`,
  "html-iframe": `<!DOCTYPE html>
<html lang="uk">
<head><meta charset="utf-8"><title>Контакти</title></head>
<body>
  <h1>Контакти</h1>
  <iframe src="https://maps.example.com/embed?place=kyiv" title="Карта проїзду до офісу" width="600" height="400" loading="lazy"></iframe>
  <iframe src="https://widgets.example.com/chat" title="Чат підтримки" sandbox="allow-scripts allow-forms" referrerpolicy="no-referrer"></iframe>
</body>
</html>
`,
};
