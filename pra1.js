/**
 * =============================================================================
 * PROGRAMACIÓN WEB - PRÁCTICA 1
 * Seguimiento de series de TV con JavaScript (datos de TVmaze)
 * =============================================================================
 *
 * Este archivo debe implementar las 9 etapas de la práctica utilizando:
 *   - Clases con campos privados, getters y setters
 *   - Métodos de clase y funciones flecha
 *   - Recursividad, reduce, map, filter
 *   - Destructuring y spread operator
 *   - Manejo de fechas con el objeto Date
 *
 * Convenciones a seguir:
 *   - Se usa `const` para valores que no cambian y `let` para los que sí.
 *   - Las funciones anónimas se escriben como arrow functions.
 *   - Los nombres siguen camelCase (variables/funciones) y PascalCase (clases).
 *   - Todos los identificadores se escriben en inglés.
 *   - Las comparaciones son siempre estrictas (=== / !==).
 *   - Se usan métodos de Array en lugar de bucles for/while
 *     (excepto en la función recursiva de la etapa 5.1).
 *   - Los datos no válidos se gestionan siempre igual: aviso con console.warn,
 *     sin modificar ningún dato, y devolviendo false / null / [].
 *   - Los comentarios siguen las 9 reglas de Ellen Spertus:
 *     explicar el "por qué", no el "qué" evidente en el código.
 *
 * Las firmas de este archivo (nombres y parámetros) son las que pide el
 * enunciado: no las cambiéis. Podéis añadir las funciones auxiliares que
 * necesitéis.
 * =============================================================================
 */

/* =============================================================================
   ETAPA 1 — Clase Show (3 puntos)
   Representa una serie con sus datos de catálogo (los que vendrán de la API).
   ============================================================================= */

class Show {
  // Recordad: el valor de rating debe guardarse en un campo con otro nombre
  // (por ejemplo, un campo privado #rating).

  #rating = null;

  constructor({
    id,
    name,
    summary,
    premiered,
    status,
    rating,
    type,
    genres,
    network,
    webChannel,
    imageUrl,
    weight,
    episodes,
  }) {
    this.id = id;
    this.name = name;
    this.summary = summary;
    this.premiered = premiered;
    this.status = status;
    this.rating = rating;
    this.type = type;
    this.genres = genres;
    this.network = network;
    this.webChannel = webChannel;
    this.imageUrl = imageUrl;
    this.weight = weight;
    this.episodes = episodes;
  }

  get rating() {
    return this.#rating;
  }

  set rating(newRating) {
    if (
      newRating !== null &&
      (typeof newRating !== "number" || newRating < 0 || newRating > 10)
    ) {
      console.warn(
        `Show.rating: Rating ha de ser null o major a 0 i menor a 10. Número: ${newRating}`,
      );
      return;
    }
    this.#rating = newRating;
  }

  get platform() {
    if (this.network && this.network.name) {
      return this.network.name;
    }
    if (this.webChannel && this.webChannel.name) {
      return this.webChannel.name;
    }
    return null;
  }
}

/* =============================================================================
   ETAPA 2 — Clase Progress (2 puntos)
   Progreso de visionado de un usuario en una serie concreta.
   ============================================================================= */

class Progress {
  //  0 / 0  vol dir "sense començar", encara no s'ha vist cap episodi
  constructor(showId, currentSeason = 0, currentEpisode = 0) {
    this.showId = showId;
    this.currentSeason = currentSeason;
    this.currentEpisode = currentEpisode;
  }

  /**
   * marca com a últim vist l'episodi indicat.
   * retorna true si s'ha actualitzat el progrés.
   * només accepta nombres positius, 0 queda exclòs
   */
  advance(season, number) {
    if (
      !Number.isInteger(season) ||
      season <= 0 ||
      !Number.isInteger(number) ||
      number <= 0
    ) {
      console.warn(
        `Progress.advance: season i number han de ser enters positius. Rebut: season=${season} (${typeof season}), number=${number} (${typeof number})`,
      );
      return false;
    }
    this.currentSeason = season;
    this.currentEpisode = number;
    return true;
  }

  /**
   * torna el progrés a 0 / 0
   */
  reset() {
    this.currentSeason = 0;
    this.currentEpisode = 0;
  }

  get hasStarted() {
    return this.currentEpisode > 0;
  }
}

/* =============================================================================
   ETAPA 3 — Clase ShowList (3 puntos)
   Lista de series que sigue el usuario: array de pares { show, progress }.
   ============================================================================= */

class ShowList {
  /**
   * cada element és una parella {show, progress}, cada serie porta el seu progrés associat.
   * és privat perquè només es pot modificat  amb addShow o removeShow
   */
  #entries;

  constructor() {
    this.#entries = [];
  }

  /**
   * retorna la parella amb el mateix id o null si no exiteix
   * és privat perquè retorna la parella  real
   */
  #findEntry(showId) {
    const entry = this.#entries.find((entry) => entry.show.id === showId);
    return entry !== undefined ? entry : null;
  }

  // get entries()  → copia de l'array de parells { show, progress }
  // és una copia  perquè no es pugui modificar externament
  get entries() {
    return [...this.#entries];
  }

  // get shows()    → array nou sol amb els objectes Show
  get shows() {
    return this.#entries.map((entry) => entry.show);
  }

  /**
   * afegeix la sèrie i crea el seu Progress 0 / 0
   * retorna true si s'ha afegit
   */
  addShow(show) {
    if (!(show instanceof Show)) {
      console.warn(`ShowList.addshow: ${show} no ès una instància de Show`);
      return false;
    }

    if (this.#findEntry(show.id) !== null) {
      console.warn(`ShowList.addShow: ${show} ja apareix a la llista`);
      return false;
    }

    const progress = new Progress(show.id);
    this.#entries.push({ show, progress });
    return true;
  }

  /**
   * elimina la parella sencera, així el progrés desapareix amb la sèrie.
   * retorna true si s'ha eliminat.
   */
  removeShow(showId) {
    if (this.#findEntry(showId) === null) {
      console.warn(
        `ShowList.removeShow: no existeix cap sèrie amb id=${showId} a la llista.`,
      );
      return false;
    }
    // filter crea un array nou, per això cal tornar-lo a assignar a #entries.
    this.#entries = this.#entries.filter((entry) => entry.show.id !== showId);
    return true;
  }

  /**
   * reinicia el progrés d'una sèrie de la llista.
   * retorna true si s'ha reiniciat.
   */
  resetProgress(showId) {
    const resetEntry = this.#findEntry(showId);

    if (resetEntry === null) {
      console.warn(
        `ShowList.resetProgress: no existeix cap sèrie amb id=${showId} a la llista.`,
      );
      return false;
    }

    resetEntry.progress.reset();
    return true;
  }

  /**
   * mostra una línia per sèrie. Una llista buida no és un error: només
   * s'informa amb console.log, no amb warn.
   */

  showList() {
    if (this.#entries.length === 0) {
      console.log(`ShowList.showList: La llista està buida.`);
      return;
    }

    this.#entries.forEach(({ show, progress }) => {
      // Format T2E5 si ha començat; si no, "Sense començar"
      const progressText = progress.hasStarted
        ? `T${progress.currentSeason}E${progress.currentEpisode}`
        : "Sense começar";
      const ratingText = show.rating !== null ? show.rating : "Sense valoració";
      console.log(
        `${show.name}, ${show.type} - Valoració: ${ratingText} - Progrés: ${progressText}`,
      );
    });
  }

  /* ===========================================================================
     ETAPA 4 — Funciones flecha dentro de ShowList (2 puntos)
     =========================================================================== */

  /**
   * afegeix més d'una serie a la vegada
   * retorna el número de series afegides realment
   */
  addMultipleShows = (...shows) => {
    let count = 0;
    shows.forEach((show) => {
      if (this.addShow(show)) {
        count++;
      }
    });
    return count;
  };

  /**
   * retorna els parells { show, progress } amb rating dins el rang.
   * [minRating, maxRating].
   * Retorna les parelles amb rating dins de [minRating, maxRating], extrems inclosos.
   */
  getShowsByRatingRange = (minRating, maxRating) => {
    if (
      typeof minRating !== "number" ||
      minRating < 0 ||
      minRating > 10 ||
      typeof maxRating !== "number" ||
      maxRating > 10 ||
      maxRating < 0 ||
      minRating > maxRating
    ) {
      console.warn(
        `ShowList.getShowsByRating: Els numeros han de estar enre 0 i 10 i el min rating ha de ser menor que max rating Rebut: ${minRating}, ${maxRating}`,
      );
      return [];
    }
    return this.#entries.filter((entry) => {
      // el null s'ha de descartar a mà.
      const rating = entry.show.rating;
      return rating !== null && rating >= minRating && rating <= maxRating;
    });
  };

  /**
   * sort modifica l'array sobre el qual s'aplica, per això s'ordena una còpia: la llista interna ha de quedar intacta.
   * b - a ordena de més a menys popular.
   */
  sortShowsByPopularity = () => {
    return [...this.#entries].sort((a, b) => b.show.weight - a.show.weight);
  };

  /* ===========================================================================
     ETAPA 5.2 — markEpisodeWatched (forma parte de la etapa 5)
     =========================================================================== */

  /**
   * Avanza el progreso de una serie hasta su siguiente episodio.
   * Devuelve el episodio marcado como visto, o null.
   */
  markEpisodeWatched(showId) {
    const entry = this.#findEntry(showId);

    if (entry === null) {
      console.warn(
        `ShowList.markEpisodeWatched: no existeix cap sèrie amb id=${showId} a la llista.`,
      );
      return null;
    }
    const nextEpisode = findNextEpisode(entry.progress, entry.show.episodes);

    if (nextEpisode === null) {
      console.warn(
        `ShowList.markEpisodeWatched: no hi ha més episodis pendents per a la sèrie amb id=${showId}.`,
      );
      return null;
    }
    entry.progress.advance(nextEpisode.season, nextEpisode.number);
    return nextEpisode;
  }
}

const findNextEpisode = (progress, episodes) => {
  //  sense començar, el pròxim és T1E1.
  if (!progress.hasStarted) {
    return findEpisodeByNumber(episodes, 1, 1);
  }

  //  següent episodi de la mateixa temporada.
  const sameSeason = findEpisodeByNumber(
    episodes,
    progress.currentSeason,
    progress.currentEpisode + 1,
  );

  //  si no existeix, primer episodi de la temporada següent.
  //  si tampoc, findEpisodeByNumber retorna null (sèrie acabada).
  return sameSeason !== null
    ? sameSeason
    : findEpisodeByNumber(episodes, progress.currentSeason + 1, 1);
};
/* =============================================================================
   ETAPA 5 — Función recursiva (4 puntos)
   ============================================================================= */

/**
 * 5.1 - Busca recursivament un episodi per temporada y número.
 * retorna l'episodi o null si no existeix.
 */
const findEpisodeByNumber = (episodes, season, number, index = 0) => {
  if (
    !Array.isArray(episodes) ||
    !Number.isInteger(season) ||
    season < 1 ||
    !Number.isInteger(number) ||
    number < 1
  ) {
    return null;
  }
  if (index >= episodes.length) {
    return null;
  }
  return episodes[index].season === season && episodes[index].number === number
    ? episodes[index]
    : findEpisodeByNumber(episodes, season, number, index + 1);
};

/* =============================================================================
   ETAPA 6 — Uso de reduce (4 puntos)
   ============================================================================= */

/**
 * retorna { genre, count } amb el gènere més freqüent amb l'array de series.
 */
const getMostCommonGenre = (shows) => {
  if (!Array.isArray(shows) || shows.length === 0) {
    return null;
  }

  //  objecte comptador del tipus { Drama: 4, Comedy: 2 }.
  //  cada sèrie té diversos gèneres, per això es recorre també show.genres.
  const genreCount = shows.reduce((acc, show) => {
    if (!Array.isArray(show.genres)) {
      return acc;
    }
    show.genres.forEach((genre) => {
      acc[genre] = (acc[genre] || 0) + 1;
    });
    return acc;
  }, {});

  //  cap sèrie tenia gèneres (genres buit o inexistent). Sense aquesta comprovació, el segon reduce retornaria { genre: null, count: 0 } en lloc de null.
  if (Object.keys(genreCount).length === 0) {
    return null;
  }

  return Object.entries(genreCount).reduce(
    (best, [genre, count]) => {
      if (count > best.count) {
        return { genre, count };
      }
      if (count === best.count && genre < best.genre) {
        return { genre, count };
      }
      return best;
    },
    { genre: null, count: 0 },
  );
};

/* =============================================================================
   ETAPA 7 — Destructuring y spread (3 puntos)
   ============================================================================= */

/**
 * Mostra per consola la informació bàsica de la sèrie i retorna una còpia.
 * L'original no es modifica.
 * retorna null (amb avís) si show no és una instància de Show.
 */
const getShowInfo = (show) => {
  if (!(show instanceof Show)) {
    console.warn(
      `getShowInfo: s'esperava una instància de Show. Rebut: ${typeof show}`,
    );
    return null;
  }

  /**
   * destructuring amb renombrat i valors per defecte.
   * genres: [firstGenre = ...] agafa el primer element de l'array; si no n'hi ha cap, s'usa "Sense gènere".
   * El "= []" cobreix que genres siga undefined.
   */
  const {
    name,
    type = "Desconegut",
    rating,
    genres: [firstGenre = "Sense gènere"] = [],
  } = show;

  const { name: networkName } = show.network || {};
  const { name: webChannelName } = show.webChannel || {};

  const ratingText = rating !== null ? rating : "Sense valorar";
  const platform = networkName || webChannelName || "Desconeguda";

  console.log(
    `Nom: ${name}, Tipus: ${type}, Valoració: ${ratingText}, Gènere principal: ${firstGenre}, Plataforma: ${platform}`,
  );

  return { ...show, rating, following: true };
};

/* =============================================================================
   ETAPA 8 — Manejo de fechas (4 puntos)
   ============================================================================= */

/**
 * retorna els dies naturals que falten des de today fins a isoDate format (aaaa-mm-dd).
 * retorna null (amb avís) si el format no és vàlid o la data no existeix.
 * today és un paràmetre perquè les proves no depenguen del dia d'execució.
 */
const daysUntil = (isoDate, today = new Date()) => {
  if (typeof isoDate !== "string") {
    console.warn(
      `daysUntil: isoDate ha de ser una cadena de text. Rebut: ${isoDate}`,
    );
    return null;
  }

  const parts = isoDate.split("-");

  if (parts.length !== 3) {
    console.warn(
      `daysUntil: EL format de la data ha de ser aaaa-mm-dd. Data introduida: ${isoDate}`,
    );
    return null;
  }

  //   força aaaa-mm-dd: longituds 4, 2 i 2 (rebutja "2026-1-5").
  if (parts[0].length !== 4 || parts[1].length !== 2 || parts[2].length !== 2) {
    console.warn(
      `daysUntil: Format de la data no valida. Data introduida: ${isoDate}. Data: aaaa-mm-dd`,
    );
    return null;
  }

  const [year, month, day] = parts.map(Number);

  //  no s'usa new Date("aaaa-mm-dd"): eixe format s'interpreta com a UTC, mentre que new Date(any, mes, dia) és hora local.
  //  el mes es resta 1 perquè en Date van de 0 (gener) a 11 (desembre).

  const date = new Date(year, month - 1, day);

  //  date no falla amb dates impossibles: "2026-02-30" passa al 2 de març. Si any, mes o dia han canviat, la data original no existia.
  //  https://www.w3schools.com/js/js_dates.asp

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    console.warn(`daysUntil: La data no existeix. Rebut: ${isoDate}`);
    return null;
  }
  const todayTime = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );

  const msPerDay = 1000 * 60 * 60 * 24;

  return Math.round((date - todayTime) / msPerDay);
};

/**
 * retorna el següent episodi pendent d'una serie o null.
 */

const getNextPendingEpisode = (show, progress) => {
  if (!(show instanceof Show) || !(progress instanceof Progress)) {
    console.warn(
      `getNextPendingEpisode: s'esperava un Show i un Progress. Rebut: show=${typeof show}, progress=${typeof progress}`,
    );
    return null;
  }

  if (progress.showId !== show.id) {
    console.warn(
      `getNextPendingEpisode: el progrés no pertany a la sèrie. progress.showId=${progress.showId}, show.id=${show.id}`,
    );
    return null;
  }

  return findNextEpisode(progress, show.episodes);
};

/* =============================================================================
   ETAPA 9 — Función avanzada con múltiples operadores (5 puntos)
   ============================================================================= */

/**
 * Retorna un resum de les sèries d'una cadena o plataforma: { platform, count, shows (títols), averageRating }.
 * Retorna null (amb avís) si shows no és un array o platformName no és un text no buit.
 * Una plataforma sense sèries no és un error: retorna count 0 i averageRating null.
 */
const getShowsByPlatform = (shows, platformName) => {
  if (
    !Array.isArray(shows) ||
    typeof platformName !== "string" ||
    platformName.trim().length === 0
  ) {
    console.warn(
      `getShowsByPlatform: s'esperava un array i un nom de plataforma no buit. Rebut: shows=${typeof shows}, platformName=${platformName}`,
    );
    return null;
  }

  const found = shows.filter((show) => show.platform === platformName);

  const showsTitle = found.map((show) => show.name);

  //  les sèries sense valoració (null) no compten ni en la suma ni en el divisor.
  const ratings = found
    .map((show) => show.rating)
    .filter((rating) => rating !== null);

  const averageRating =
    ratings.length === 0
      ? null
      : ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;

  return {
    platform: platformName,
    count: found.length,
    shows: showsTitle,
    averageRating: averageRating,
  };
};

/* =============================================================================
   DATOS DE PRUEBA
   Datos reales de la API de TVmaze (consultados en septiembre de 2026),
   simplificados para la práctica: cada serie incluye solo algunos episodios
   por temporada y el resumen está en castellano y en texto plano.
   Hay tres excepciones, pensadas para poder probar todos los casos:
     - weight: en la API vale 100 en todas estas series. Aquí usamos valores
       distintos para que ordenar por popularidad dé un resultado visible.
     - El episodio T3E1 de The Last of Us, anunciado pero sin fecha.
     - La serie "Proyecto Aurora", sin valoración, sin géneros, sin cadena
       ni plataforma y con estrenos futuros.
   ============================================================================= */

const breakingBad = new Show({
  id: 169,
  name: "Breaking Bad",
  summary:
    "Un profesor de química con cáncer terminal empieza a fabricar metanfetamina para asegurar el futuro de su familia.",
  premiered: "2008-01-20",
  status: "Ended",
  rating: 9.2,
  type: "Scripted",
  genres: ["Drama", "Crime", "Thriller"],
  network: {
    name: "AMC",
    country: {
      name: "United States",
      code: "US",
      timezone: "America/New_York",
    },
  },
  webChannel: null,
  imageUrl:
    "https://static.tvmaze.com/uploads/images/medium_portrait/501/1253519.jpg",
  weight: 98,
  episodes: [
    {
      season: 1,
      number: 1,
      name: "Pilot",
      airdate: "2008-01-20",
      summary: "",
      runtime: 60,
    },
    {
      season: 1,
      number: 2,
      name: "Cat's in the Bag...",
      airdate: "2008-01-27",
      summary: "",
      runtime: 60,
    },
    {
      season: 1,
      number: 3,
      name: "...and the Bag's in the River",
      airdate: "2008-02-10",
      summary: "",
      runtime: 60,
    },
    {
      season: 2,
      number: 1,
      name: "Seven Thirty-Seven",
      airdate: "2009-03-08",
      summary: "",
      runtime: 60,
    },
    {
      season: 2,
      number: 2,
      name: "Grilled",
      airdate: "2009-03-15",
      summary: "",
      runtime: 60,
    },
  ],
});

const gameOfThrones = new Show({
  id: 82,
  name: "Game of Thrones",
  summary:
    "Varias familias nobles luchan por el control del Trono de Hierro de los Siete Reinos.",
  premiered: "2011-04-17",
  status: "Ended",
  rating: 8.9,
  type: "Scripted",
  genres: ["Drama", "Adventure", "Fantasy"],
  network: {
    name: "HBO",
    country: {
      name: "United States",
      code: "US",
      timezone: "America/New_York",
    },
  },
  webChannel: null,
  imageUrl:
    "https://static.tvmaze.com/uploads/images/medium_portrait/498/1245274.jpg",
  weight: 99,
  episodes: [
    {
      season: 1,
      number: 1,
      name: "Winter is Coming",
      airdate: "2011-04-17",
      summary: "",
      runtime: 60,
    },
    {
      season: 1,
      number: 2,
      name: "The Kingsroad",
      airdate: "2011-04-24",
      summary: "",
      runtime: 60,
    },
    {
      season: 2,
      number: 1,
      name: "The North Remembers",
      airdate: "2012-04-01",
      summary: "",
      runtime: 60,
    },
  ],
});

const strangerThings = new Show({
  id: 2993,
  name: "Stranger Things",
  summary:
    "Tras la desaparición de un niño, un pueblo descubre experimentos secretos y fuerzas sobrenaturales.",
  premiered: "2016-07-15",
  status: "Ended",
  rating: 8.4,
  type: "Scripted",
  genres: ["Drama", "Horror", "Science-Fiction"],
  network: null,
  webChannel: { name: "Netflix", country: null },
  imageUrl:
    "https://static.tvmaze.com/uploads/images/medium_portrait/595/1489169.jpg",
  weight: 99,
  episodes: [
    {
      season: 1,
      number: 1,
      name: "Chapter One: The Vanishing of Will Byers",
      airdate: "2016-07-15",
      summary: "",
      runtime: 49,
    },
    {
      season: 1,
      number: 2,
      name: "Chapter Two: The Weirdo on Maple Street",
      airdate: "2016-07-15",
      summary: "",
      runtime: 56,
    },
    {
      season: 2,
      number: 1,
      name: "Chapter One: MADMAX",
      airdate: "2017-10-27",
      summary: "",
      runtime: 48,
    },
  ],
});

const theLastOfUs = new Show({
  id: 46562,
  name: "The Last of Us",
  summary:
    "Veinte años después de una pandemia, un superviviente escolta a una adolescente a través de un país devastado.",
  premiered: "2023-01-15",
  status: "Running",
  rating: 7.9,
  type: "Scripted",
  genres: ["Drama", "Action", "Horror"],
  network: {
    name: "HBO",
    country: {
      name: "United States",
      code: "US",
      timezone: "America/New_York",
    },
  },
  webChannel: null,
  imageUrl:
    "https://static.tvmaze.com/uploads/images/medium_portrait/563/1409008.jpg",
  weight: 97,
  episodes: [
    {
      season: 1,
      number: 1,
      name: "When You're Lost in the Darkness",
      airdate: "2023-01-15",
      summary: "",
      runtime: 85,
    },
    {
      season: 1,
      number: 2,
      name: "Infected",
      airdate: "2023-01-22",
      summary: "",
      runtime: 56,
    },
    {
      season: 2,
      number: 1,
      name: "Future Days",
      airdate: "2025-04-13",
      summary: "",
      runtime: 62,
    },
    // Ficticio: episodio anunciado pero sin fecha de emisión conocida.
    // (En la API, un episodio sin fecha llega con airdate ""; aquí usamos null.)
    {
      season: 3,
      number: 1,
      name: "TBA",
      airdate: null,
      summary: "",
      runtime: null,
    },
  ],
});

const severance = new Show({
  id: 44933,
  name: "Severance",
  summary:
    "Los empleados de una empresa se someten a un procedimiento que separa sus recuerdos del trabajo y de su vida personal.",
  premiered: "2022-02-18",
  status: "Running",
  rating: 7.7,
  type: "Scripted",
  genres: ["Drama", "Science-Fiction", "Mystery"],
  network: null,
  webChannel: { name: "Apple TV", country: null },
  imageUrl:
    "https://static.tvmaze.com/uploads/images/medium_portrait/548/1371406.jpg",
  weight: 96,
  episodes: [
    {
      season: 1,
      number: 1,
      name: "Good News About Hell",
      airdate: "2022-02-18",
      summary: "",
      runtime: 57,
    },
    {
      season: 1,
      number: 2,
      name: "Half Loop",
      airdate: "2022-02-18",
      summary: "",
      runtime: 53,
    },
    {
      season: 2,
      number: 1,
      name: "Hello, Ms. Cobel",
      airdate: "2025-01-17",
      summary: "",
      runtime: 48,
    },
  ],
});

// Serie ficticia pensada para los casos límite: sin valoración, sin géneros,
// sin cadena ni plataforma y con episodios que se emitirán en el futuro.
const proyectoAurora = new Show({
  id: 90001,
  name: "Proyecto Aurora",
  summary: "Serie ficticia para las pruebas de la práctica.",
  premiered: "2026-11-20",
  status: "To Be Determined",
  rating: null,
  type: "Documentary",
  genres: [],
  network: null,
  webChannel: null,
  imageUrl: "",
  weight: 40,
  episodes: [
    {
      season: 1,
      number: 1,
      name: "Episodio 1",
      airdate: "2026-11-20",
      summary: "",
      runtime: 45,
    },
    {
      season: 1,
      number: 2,
      name: "Episodio 2",
      airdate: "2026-11-27",
      summary: "",
      runtime: 45,
    },
  ],
});

// Fecha fija para que los resultados de las pruebas de fechas no dependan del
// día en que se ejecuten: 13 de noviembre de 2026 en hora local.
const TODAY = new Date(2026, 10, 13);

/* =============================================================================
   PRUEBAS
   Añadid aquí las llamadas necesarias para probar todas las etapas y ver los
   resultados por consola. Incluid también pruebas con datos no válidos y con
   los casos límite que indica el enunciado.
   ============================================================================= */

console.log(`---- ETAPA 1 ----`);

const s = new Show({ id: 1, name: "test", rating: 9 });
console.log(s.rating);

const bad = new Show({ id: 2, name: "test2", rating: "no rating" });
console.log(bad.rating);

// rating
s.rating = 10;
console.log(s.rating);

s.rating = -4;
console.log(s.rating);

s.rating = null;
console.log(s.rating);

console.log(strangerThings.platform);
console.log(breakingBad.platform);
console.log(proyectoAurora.platform);

console.log(`---- ETAPA 2 ----`);

const p = new Progress(1);
console.log(p.showId, p.currentSeason, p.currentEpisode);
console.log(p.hasStarted);

// advance
console.log(p.advance(2, 5));
console.log(p.showId, p.currentSeason, p.currentEpisode);
console.log(p.hasStarted);

console.log(p.advance(1.5, 2));
console.log(p.advance("2", 5));
console.log(p.advance(null, 1));
console.log(p.advance(NaN, 1));
console.log(p.advance(undefined, 1));
console.log(p.currentSeason, p.currentEpisode);

// reset
p.reset();
console.log(p.currentSeason, p.currentEpisode);
console.log(p.hasStarted);

console.log(p.advance(1, 1));
console.log(p.hasStarted);

console.log(`---- ETAPA 3 ----`);
const list = new ShowList();

// llista vuida
list.showList();

// addShow
console.log(list.addShow(breakingBad));
console.log(list.addShow(theLastOfUs));
console.log(list.addShow(severance));
console.log(list.addShow(severance));
console.log(list.addShow({ id: 5 }));
console.log(list.addShow(null));
console.log(list.shows.length);

// comprovem el progrès
console.log(list.entries[0].progress.showId);
console.log(list.entries[0].progress.hasStarted);

//no modifica la llista
list.entries.push("x");
list.shows.pop();
console.log(list.entries.length);
console.log(list.shows.length);

// ShowList amb progrès
list.entries[0].progress.advance(2, 5);
list.showList();

// resetProgress
console.log(list.resetProgress(169));
console.log(list.entries[0].progress.currentSeason);
console.log(list.resetProgress(2294943));

// removeShow
console.log(list.removeShow(44933));
console.log(list.shows.length);
console.log(list.removeShow(44933));
list.showList();

console.log(`---- ETAPA 4 ----`);
const list4 = new ShowList();

// addMulitipleSHows

console.log(
  list4.addMultipleShows(
    breakingBad,
    gameOfThrones,
    strangerThings,
    theLastOfUs,
    severance,
    breakingBad,
  ),
);

console.log(list4.shows.length);

//getShowsByRatingRange
const showName = (shows) => shows.map((e) => e.show.name);

console.log(showName(list4.getShowsByRatingRange(5, 10)));
console.log(showName(list4.getShowsByRatingRange(5, 9)));
console.log(list4.getShowsByRatingRange(9.5, 10));

console.log(list4.getShowsByRatingRange(5, 11));
console.log(list4.getShowsByRatingRange(9, 1));
console.log(list4.getShowsByRatingRange(-6, 7));
console.log(list4.getShowsByRatingRange("a", 6));

//sortShowsByPopularity
const popularity = list4.shows.map((s) => s.name);
console.log(showName(list4.sortShowsByPopularity()));

console.log(`---- ETAPA 5 ----`);
const breakingBadEp = breakingBad.episodes;

// findEpiisodeByNumber
console.log(findEpisodeByNumber(breakingBadEp, 1, 2).name);
console.log(findEpisodeByNumber(breakingBadEp, 2, 2).name);
console.log(findEpisodeByNumber(breakingBadEp, 1, 9));
console.log(findEpisodeByNumber(breakingBadEp, -1, 1));
console.log(findEpisodeByNumber(breakingBadEp, "a", 2));
console.log(findEpisodeByNumber(breakingBadEp, 1, 1.1));

//findNextEpisode
console.log(findNextEpisode(new Progress(169), breakingBadEp).name);
console.log(findNextEpisode(new Progress(169, 1, 3), breakingBadEp).name);
console.log(findNextEpisode(new Progress(169, 2, 2), breakingBadEp));

//markEpisodeWatched
const list5 = new ShowList();
list5.addMultipleShows(breakingBad, proyectoAurora);

for (let i = 0; i < 5; i++) {
  const ep = list5.markEpisodeWatched(169);
  console.log(`T${ep.season}E${ep.number} ${ep.name}`);
}
// warn + null (acabada)
console.log(list5.markEpisodeWatched(169));

// warn + null (no existe)
console.log(list5.markEpisodeWatched(999));

console.log(`---- ETAPA 6 ----`);
const all = [
  breakingBad,
  gameOfThrones,
  strangerThings,
  theLastOfUs,
  severance,
  proyectoAurora,
];

// genere amb mès presència
console.log(getMostCommonGenre(all));

// amb ShowList
const list6 = new ShowList();
list6.addMultipleShows(breakingBad, gameOfThrones, theLastOfUs);
console.log(getMostCommonGenre(list6.shows));

console.log(`---- ETAPA 7 ----`);
const info = getShowInfo(breakingBad);

console.log(info.rating);
console.log(info.following);
console.log(info.name);

console.log(getShowInfo(null));
console.log(getShowInfo("hola"));

console.log(`---- ETAPA 8 ----`);
// daysUntil
console.log(daysUntil("2026-11-20", TODAY));
console.log(daysUntil("2026-11-10", TODAY));
console.log(daysUntil("2027-01-01", TODAY));

console.log(daysUntil("2026-13-45", TODAY));
console.log(daysUntil("2026-02-30", TODAY));

console.log(daysUntil("abcd-ef-gh", TODAY));
console.log(daysUntil("", TODAY));
console.log(daysUntil(null, TODAY));

// getNextPendingEpisode
const pr = new Progress(breakingBad.id);
console.log(getNextPendingEpisode(breakingBad, pr).name);
pr.advance(2, 2);
console.log(getNextPendingEpisode(breakingBad, pr));

console.log(`---- ETAPA 9 ----`);
const all9 = [
  breakingBad,
  gameOfThrones,
  strangerThings,
  theLastOfUs,
  severance,
  proyectoAurora,
];

console.log(getShowsByPlatform(all9, "HBO"));
console.log(getShowsByPlatform(all9, "Netflix"));
console.log(getShowsByPlatform(all9, "Disney+"));

console.log(getShowsByPlatform("hola", "HBO"));
console.log(getShowsByPlatform(all9, ""));
console.log(getShowsByPlatform(all9, "   "));
