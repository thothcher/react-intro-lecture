import { head, IMG, bwImage, snippet } from './helpers.js';
import { url, PAGES } from '../scene/assets.js';
import { icons } from '../components/icons.js';

const STAGE = '01 / ORDINARY WORLD';

export default [
  {
    id: 'title',
    stage: STAGE,
    title: 'Vanilla JS → React',
    time: '0:00 – 1:00 (1 წთ)',
    notes: `
      <p>მისალმება. დღეს ვაჩვენებთ <b>რეალურ პრობლემას</b> vanilla JS-ში და როგორ წყვეტს მას React.</p>
      <p>სტრუქტურა: ~45 წთ თეორია (Hero's Journey — ზედა მარცხენა კუთხეში ეტაპი ჩანს), 10 წთ შესვენება, ~45 წთ პრაქტიკა.</p>
      <p>მთავარი იდეა ერთი წინადადებით: <b>"როცა UI იზრდება, ხელით DOM-ის მართვა ვეღარ მასშტაბირდება."</b></p>`,
    html: () => `
      <div class="title-slide">
        <div class="title-text">
          <p class="kicker mono">FRONTEND · REACT-ის შესავალი</p>
          <h1>Vanilla JS <span class="title-arrow">${icons.arrow}</span> React</h1>
          <p class="lead">ერთი რესტორანი, ორი მიდგომა — და მომენტი, როცა React აუცილებელი ხდება.</p>
          <dl class="meta">
            <div><dt class="mono">თეორია</dt><dd>~45 წთ</dd></div>
            <div><dt class="mono">შესვენება</dt><dd>10 წთ</dd></div>
            <div><dt class="mono">პრაქტიკა</dt><dd>~45 წთ</dd></div>
          </dl>
        </div>
        ${bwImage(IMG.architecture, 'title-img')}
      </div>`,
  },

  {
    id: 'site',
    stage: STAGE,
    title: 'ამის აწყობა უკვე იცით',
    time: '1:00 – 2:00 (1 წთ)',
    notes: `
      <p>ეს ჩვენი რესტორნის საიტია. <b>ორჯერ</b> არის აწყობილი: vanilla JS-ით და React-ით — იგივე დიზაინი, იგივე Swagger API.</p>
      <p>ორივე live-ია GitHub Pages-ზე (მისამართები ეკრანზეა). შეგიძლიათ აჩვენოთ ბრაუზერში 20 წამით.</p>
      <p>ხაზი გაუსვით: "ამას <b>თქვენ უკვე</b> შეძლებდით vanilla JS-ით. საკითხავია — რა ფასად?"</p>`,
    html: () => `
      ${head('ამის აწყობა უკვე იცით', 'ერთი და იგივე რესტორანი, ორჯერ აწყობილი: vanilla JS-ით და React-ით. იგივე დიზაინი, იგივე API.')}
      <div class="site-grid">
        <figure class="browser">
          <div class="browser-bar"><i></i><i></i><i></i><span class="mono">thothcher.github.io/restaurant-vanilla-js</span></div>
          <img src="${url('vanilla', 'home')}" alt="რესტორნის მთავარი გვერდი">
        </figure>
        <dl class="spec">
          <div><dt class="mono">გვერდები</dt><dd>10 — მთავარი, მენიუ, პროდუქტი, კალათა, პროფილი, შესვლა…</dd></div>
          <div><dt class="mono">API</dt><dd>Swagger · <span class="mono">restaurantapi.stepacademy.ge</span></dd></div>
          <div><dt class="mono">ავტორიზაცია</dt><dd>JWT — access + refresh token</dd></div>
          <div><dt class="mono">ფუნქციები</dt><dd>ფილტრები, კალათა, checkout, პროფილი</dd></div>
          <div><dt class="mono">ხარისხი</dt><dd>Responsive, dark mode, SEO, ფორმების ვალიდაცია</dd></div>
          <div><dt class="mono">live</dt><dd class="mono links">/restaurant-vanilla-js<br>/restaurant-react</dd></div>
        </dl>
      </div>
      <ol class="thumbs">
        ${PAGES.map((p) => `<li><img src="${url('vanilla', p.key)}" alt="" loading="lazy"><span class="mono">${p.route}</span></li>`).join('')}
      </ol>`,
  },

  {
    id: 'recap',
    stage: STAGE,
    title: 'რაც უკვე იცით',
    time: '2:00 – 3:00 (1 წთ)',
    notes: `
      <p>სწრაფი გამეორება — ეს ხუთი რამ ყველამ იცის. კოდი ჩვენი vanilla პროექტიდანაა.</p>
      <p>ხაზი გაუსვით მე-4-ს: <b>DOM-ის ხელით შეცვლა</b>. დღეს სწორედ ეს გახდება პრობლემა.</p>
      <p>React არცერთს არ აუქმებს — ის ამ ყველაფრის <b>ზემოთ</b> დგას.</p>`,
    html: () => `
      ${head('რაც უკვე იცით', 'ხელსაწყოები, რომლებითაც vanilla ვერსია აიწყო. React არცერთს არ აუქმებს — მათ ზემოთ დგას.')}
      <ol class="recap">
        ${[
          ['HTML', 'სტრუქტურა', 's3-html'],
          ['CSS', 'იერსახე', 's3-css'],
          ['JavaScript', 'ლოგიკა', 's3-js'],
          ['DOM', 'ეკრანის ხელით შეცვლა', 's3-dom', true],
          ['fetch', 'სერვერთან საუბარი', 's3-fetch'],
        ].map(([term, desc, sn, key], i) => `
          <li class="${key ? 'is-key' : ''}">
            <span class="recap-n mono">0${i + 1}</span>
            <h3>${term}</h3>
            <p>${desc}</p>
            ${snippet(sn, { numbers: false, cls: 'code--mini' })}
          </li>`).join('')}
      </ol>
      <p class="recap-foot"><span class="kicker mono">დღევანდელი თემა</span><span>React არცერთ მათგანს არ ცვლის — ის ცვლის მხოლოდ <b class="accent">04</b>-ს: <b>როგორ</b> განახლდება ეკრანი, როცა მონაცემი იცვლება.</span></p>`,
  },
];
