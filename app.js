document.addEventListener("DOMContentLoaded", () => {
  const programUrl = "program.json";
  const tabNav = document.getElementById("day-tabs");
  const content = document.getElementById("program-content");

  let programData = [];
  let currentTab = 19; // default tab

  // Load JSON
  fetch(programUrl)
    .then((res) => res.json())
    .then((data) => {
      programData = data;
      renderTabs(data);
      renderContent();
    })
    .catch(() => {
      tabNav.innerHTML = "<p>Error loading program.</p>";
    });

  function getVenueTimeRange(startTimeStr, durationStr) {
    if (!startTimeStr || !durationStr) return "";

    const [startH, startM] = startTimeStr.split(":").map(Number);
    const [durH, durM] = durationStr.split(":").map(Number);

    if ([startH, startM, durH, durM].some(isNaN)) return "";

    const startDate = new Date(0, 0, 0, startH, startM);
    const endDate = new Date(0, 0, 0, startH + durH, startM + durM);

    const pad = (n) => n.toString().padStart(2, "0");

    return `${pad(startDate.getHours())}:${pad(startDate.getMinutes())}–${pad(
      endDate.getHours()
    )}:${pad(endDate.getMinutes())}`;
  }

  function loadFavorites() {
    return JSON.parse(localStorage.getItem("favorites") || "[]");
  }

  function saveFavorites(list) {
    localStorage.setItem("favorites", JSON.stringify(list));
  }

  function renderTabs(data) {
    tabNav.innerHTML = "";
    const tabs = [
      ...data.map((day) => ({
        label: "Dia " + day.day,
        value: day.day,
      })),
      { label: "Highlights", value: "highlights" },
      { label: "Os meus favoritos", value: "favorites" },
    ];

    tabs.forEach(({ label, value }) => {
      const btn = document.createElement("button");
      btn.textContent = label;
      btn.dataset.tab = value;
      btn.className = "tab-button";
      if (value === currentTab) btn.classList.add("active");
      btn.addEventListener("click", () => {
        currentTab = value;
        document
          .querySelectorAll(".tab-button")
          .forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        renderContent();
      });
      tabNav.appendChild(btn);
    });
  }

  function renderContent() {
    const favorites = loadFavorites();
    content.innerHTML = "";

    if (currentTab === "highlights") {
      programData.forEach((day) => {
        const highlightVenues = day.venues
          .map((venue) => ({
            ...venue,
            sessions: venue.sessions.filter((s) => s.highlight === 1),
          }))
          .filter((venue) => venue.sessions.length > 0);
        if (highlightVenues.length > 0) {
          const section = createDaySection(day.day, highlightVenues, favorites);
          content.appendChild(section);
        }
      });
    } else if (currentTab === "favorites") {
      const favoriteSessions = [];
      programData.forEach((day) => {
        day.venues.forEach((venue) => {
          const matched = venue.sessions.filter((s) =>
            favorites.includes(s.id)
          );
          if (matched.length > 0) {
            favoriteSessions.push({ ...venue, sessions: matched });
          }
        });
      });

      if (favoriteSessions.length === 0) {
        const messages = [
          "Parece que ainda não escolheste os teus ☆favoritos. Não te preocupes — o programa está cheio de pérolas",
          "A tua lista de ☆favoritos está vazia… por agora. Espreita o programa e escolhe as sessões que te despertarem a curiosidade!",
          "Sem ☆favoritos? Atitude arrojada. Mas talvez valha a pena guardar aquelas sessões a que queres mesmo assistir como favoritas.",
          "Ainda não sabes por onde começar? Usa a força!... ou então espreita as abas do programa e começa a escolher os teus ☆favoritos ;)",
          "Esta página está a sentir-se sozinha. Assim que começares a clicar nas ☆estrelinhas, as tuas sessões favoritas vão sentir-se em casa por aqui!",
          "Nem o John Cage aguentava tanto vazio. Vai lá, escolhe uma sessão, clica na 'tecla' dos ☆favoritos e faz esta página sentir algo.",
          "Esta secção está mais vazia do que uma galeria na véspera da inauguração... Vá lá, está na hora de escolher os teus próprios ☆favoritos!",
          "Esta página está numa performance de silêncio... mas tu podes dar-lhe voz com uns bons ☆favoritos.",
          "Sem favoritos? Isso é arte conceptual ou só indecisão? Arrisca, escolhe uma sessão e chama-lhe a tua ☆favorita.",
          "Mesmo um happening precisa de público. Escolhe as sessões ☆favoritas que queres aplaudir de pé (ou sentado, com café na mão).",
          "Isto está tão vazio que até o Paulo Freire te pedia para intervir. Vai lá, escolhe as tuas sessões ☆favoritas e liberta este conteúdo!",
          "A pedagogia do oprimido começa por oprimir esta página vazia. Revoluciona-a com uns bons ☆favoritos.",
          "Isto não é uma aula expositiva — aqui és tu que escolhes o currículo. Seleciona as sessões ☆favoritas que fazem sentido para ti!",
          "Página em branco? Ótimo ponto de partida para uma prática crítica. Clica numa ☆estrela e começa a construir o teu saber situado.",
          "Mesmo uma escola sem muros precisa de algum plano. Cria o teu — começa por guardar as sessões ☆favoritas que te provocam.",
          "Isto está mais lento que um plano-sequência do Tarkovsky. Dá-lhe ritmo e adiciona uns ☆favoritos ao guião.",
          "Se esta página fosse um filme, estava no modo contemplativo. Mas até o Godard precisava de montagem — faz a tua montagem com as tuas sessões ☆favoritas!",
          "O importante não é a queda... é a aterragem. E neste caso, o importante não é quantas abas de sessões abriste... é em qual aterras! Começa a escolher as tuas 'quedas' ☆favoritas!",
          "'Bom design é o mínimo design possível' — mas zero ☆favoritos ? Vá lá, nem o Dieter Rams aprovaria tanta contenção!",
          "Sem ☆favoritos? Parece mais um exercício de branding genérico do que um manifesto pessoal. Dá-lhe identidade.",
          "Design é o embaixador silencioso da tua ideia. Mas esta página está demasiado silenciosa. Acrescenta um ☆favorito e faz com que ela te represente",
          "Epá!, Frutiger tinha razão — mas esta pausa já dura demasiado. Marca uma sessão como ☆favorita antes que o silêncio vire um concerto de indecisão.",
          "Não guardar nenhum favorito ☆ ? Pode ser um erro… pedagógico. Mas como dizia a Scher: cresce com isso — escolhe uma sessão e aprende no processo.",
          "Reconhecer que esta página precisa de ☆favoritos… é o primeiro passo. Vai, faz como os Eames: dá forma à tua curiosidade.",
          "Não guardes ☆favoritos por obrigação. Escolhe as sessões com que queres interagir. Isto é design da experiência... da tua.",
          "Este vazio pode parecer bonito, mas não funciona. Adiciona sessões ☆favoritas e melhora a experiência da tua própria conferência.",
          "Esta página está presa no vazio. Liberta-a com os teus ☆favoritos  — como diria bell hooks, educar é um ato de liberdade (e clicar também conta).",
          "Não marcar sessões ☆favoritas é só mais um ritual de desatenção. Faz desescolarização ativa: escolhe com sentido e desafia o programa estabelecido.",
          "Se o teu programa não tiver ritmo, não vale a pena. Escolhe sessões ☆favoritas que te façam pensar, dançar ou — vá — pelo menos levantar uma sobrancelha.",
          "Não há aprendizagem sem escolha. Reinventa o teu percurso: marca uma sessão nos teus ☆favoritos e vê o que acontece quando tomas as rédeas.",
        ];
        const randomMsg = messages[Math.floor(Math.random() * messages.length)];
        const div = document.createElement("div");
        div.className = "empty-favorites";
        div.innerHTML = `<p>${randomMsg}</p>`;
        content.appendChild(div);
      } else {
        const section = createDaySection(
          "Favorites",
          favoriteSessions,
          favorites
        );
        content.appendChild(section);
      }
    } else {
      const dayData = programData.find((d) => d.day === currentTab);
      if (dayData) {
        const section = createDaySection(
          dayData.day,
          dayData.venues,
          favorites
        );
        content.appendChild(section);
      }
    }
  }

  function createDaySection(day, venues, favorites) {
    const section = document.createElement("section");
    section.className = "day";
    section.dataset.day = day;

    venues.forEach((venue) => {
      const venueEl = document.createElement("section");
      venueEl.className = "venue";
      venueEl.id = `venue-${
        venue.id || Math.random().toString(36).substring(2, 8)
      }`;

      const header = document.createElement("header");
      header.className = "venue-header";

      const venueClass = (venue.title || "")
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "-") // replace non-alphanumerics with dashes
        .replace(/-+/g, "-") // collapse multiple dashes
        .replace(/^-|-$/g, ""); // trim leading/trailing dashes

      venueEl.classList.add(`venue-${venueClass}`);

      header.innerHTML = `
          <p class="venue-title">${venue.title || ""}</p>

          ${
            venue.moderator
              ? `<p class="venue-moderator"><strong class="venue-moderator-tag">Moderação:</strong> ${venue.moderator}</p>`
              : ""
          }

          ${
            venue.room || venue.location
              ? `<p class="venue-room">
                  ${
                    venue.room
                      ? `<span class="venue-room-tag"><strong>Sala: </strong> ${
                          venue.location === "Modo virtual"
                            ? `<a href="${venue.room}" target="_blank">Link Zoom</a>`
                            : venue.room
                        }</span>`
                      : ""
                  }
                  ${
                    venue.location
                      ? `<span class="venue-location-tag"><strong>Local: </strong> ${venue.location}</span>`
                      : ""
                  }
                </p>`
              : ""
          }

          <p class="venue-time-meta">
            ${
              venue.time && venue.duration
                ? `<span class="venue-time-tag"><strong>Hora:</strong> ${getVenueTimeRange(
                    venue.time,
                    venue.duration
                  )}</span>`
                : ""
            }
            ${
              venue.venue_date
                ? `<span class="venue-date-tag"> &nbsp; &nbsp; &nbsp;<strong>Date:</strong> ${venue.venue_date}</span>`
                : ""
            }
          </p>
        `;

      venueEl.appendChild(header);

      const sessionWrap = document.createElement("div");
      sessionWrap.className = "sessions";

      venue.sessions.forEach((session) => {
        const article = document.createElement("article");
        article.className = "session";
        article.id = `session-${session.id}`;
        // article.classList.add("session");
        // article.style.flex = `0 0 ${Math.min(
        //   Math.max(parseInt(session.duration_pct || "40"), 40),
        //   100
        // )}%`;

        // article.style.width = `${parseInt(session.duration_pct)}%`;

        article.style.flex = `0 0 ${Math.min(
          Math.max(parseInt(session.duration_pct || "20"), 25),
          100
        )}%`;

        const isFav = favorites.includes(session.id);
        article.innerHTML = `
          ${
            session.thumbnail
              ? `<img src="${session.thumbnail}" alt="" class="session-thumb" />`
              : ""
          }
          <h1 class="session-title">${session.title || ""}</h1>
          ${
            session.author
              ? `<h2 class="session-author"><strong class="session-author-tag">Autoria:</strong> ${session.author}</h2>`
              : ""
          }
          ${
            session.type
              ? `<p class="session-type"><strong class="sessiontype-tag"></strong> ${session.type}</p>`
              : ""
          }
          <button class="fav-btn" data-id="${session.id}">
            ${currentTab === "favorites" ? "✕" : isFav ? "" : "☆"}
          </button>

          <button class="info-btn" data-id="${session.id}">Ler mais</button>

        `;
        sessionWrap.appendChild(article);
      });

      venueEl.appendChild(sessionWrap);
      section.appendChild(venueEl);
    });

    return section;
  }

  // Handle favorite button actions
  content.addEventListener("click", (e) => {
    if (e.target.matches(".fav-btn")) {
      const id = e.target.dataset.id;
      let favs = loadFavorites();
      const index = favs.indexOf(id);

      if (index > -1) {
        favs.splice(index, 1);
      } else {
        favs.push(id);
      }

      saveFavorites(favs);
      renderContent();
    }
  });

  // MODAL WINDOWS

  // Create and append modal structure
  const modal = document.createElement("div");
  modal.id = "session-modal";
  modal.innerHTML = `
    <div class="modal-content">
      <div id="modal-scroll">
        <section id="modal-header"></section>
        <section id="modal-meta"></section>
        <section id="modal-info"></section>
        <section id="modal-authors"></section>
      </div>
      <button id="modal-close" aria-label="Close modal"> × </button>
      
    </div>
  `;
  document.body.appendChild(modal);

  // Close modal button
  document.getElementById("modal-close").addEventListener("click", () => {
    modal.classList.remove("visible");
    document.body.classList.remove("modal-open");
  });

  // Close on Escape key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      modal.classList.remove("visible");
      document.body.classList.remove("modal-open");
    }
  });

  // Close on outside click
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.classList.remove("visible");
      document.body.classList.remove("modal-open");
    }
  });

  // Show modal with session data
  const target_content = document.getElementById("program-content");

  target_content.addEventListener("click", (e) => {
    if (e.target.matches(".info-btn")) {
      const sessionId = e.target.dataset.id;
      let sessionData = null;
      let venueData = null;

      for (const day of programData) {
        for (const venue of day.venues) {
          for (const session of venue.sessions) {
            if (session.id === sessionId) {
              sessionData = session;
              venueData = venue;
              break;
            }
          }
        }
      }

      if (!sessionData || !venueData) return;

      const header = document.getElementById("modal-header");
      const meta = document.getElementById("modal-meta");
      const info = document.getElementById("modal-info");
      const authors = document.getElementById("modal-authors");

      header.innerHTML = `
        <h2>${sessionData.title || "Untitled"}</h2>
        <p><strong>Autoria:</strong> ${sessionData.author || ""}</p>
        ${
          sessionData.affiliations
            ? `<p><strong>Filiação:</strong> ${sessionData.affiliations}</p>`
            : ""
        }
        <p>&nbsp;</p>
        <hr />
      `;

      meta.innerHTML = `
        <p>&nbsp;</p>
        <p><strong>Painel:</strong> ${venueData.title || ""}</p>
        <p>
          ${
            venueData.location === "Modo virtual"
              ? `<strong>Link Zoom: </strong> <a href="${venueData.room}" target="_blank">${venueData.room}</a>`
              : `<strong>Sala: </strong> ${venueData.room}`
          }
         </p>
        <p><strong>Local:</strong> ${venueData.location || ""}</p>
        <p><strong>Data:</strong> ${venueData.venue_date || ""}</p>
        <p><strong>Hora:</strong> ${venueData.time || ""}</p>
      `;

      info.innerHTML = `
        <h3>Resumo</h3>
        <p>${sessionData.abstract || "—"}</p>
        <p>&nbsp;</p>
        <h3>Referências</h3>
        
        <p>${sessionData.references || "—"}</p>
        <p>&nbsp;</p>
        
        <h3>Palavras-chave</h3>
        <p>${sessionData.keywords || "—"}</p>
        <p>&nbsp;</p>
      `;

      authors.innerHTML = `
        <h3>Biografia(s)</h3>
        <p>${sessionData.biographies || "—"}</p>
      `;

      modal.classList.add("visible");
      document.body.classList.add("modal-open");
    }
  });
});
