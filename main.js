import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";
const supabaseUrl = 'https://iwbvimwodjlbtxtmfqra.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml3YnZpbXdvZGpsYnR4dG1mcXJhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgwNzQ5NDYsImV4cCI6MjA2MzY1MDk0Nn0.S0M8kMbFc4cx7s6I8dNYAxFCRQICeLjRdQ_Uw1TKSTo';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Søgefelt Autocomplete
const input = document.getElementById('search');
const suggBox = document.getElementById('suggestions');
input.addEventListener('input', async () => {
  const val = input.value.trim().toLowerCase();
  suggBox.innerHTML = '';
  if (!val) {
    suggBox.style.display = 'none';
    return;
  }
  const { data: spilData } = await supabase
    .from('dagensspil')
    .select('id, hold1, hold2, liga')
    .or(`hold1.ilike.%${val}%,hold2.ilike.%${val}%,liga.ilike.%${val}%`)
    .limit(5);
  const { data: nyhedData } = await supabase
    .from('nyheder')
    .select('id, titel')
    .or(`titel.ilike.%${val}%`)
    .limit(5);
  if ((!spilData || spilData.length === 0) && (!nyhedData || nyhedData.length === 0)) {
    suggBox.style.display = 'none';
    return;
  }
  suggBox.style.width = input.offsetWidth + 'px';
  if (spilData && spilData.length > 0) {
    spilData.forEach(spil => {
      const li = document.createElement('li');
      li.textContent = `Dagens Spil: ${spil.hold1 || ''} vs ${spil.hold2 || ''} (${spil.liga || ''})`;
      li.addEventListener('click', () => {
        window.location.href = `dagensspil.html?id=${spil.id}`;
      });
      suggBox.appendChild(li);
    });
  }
  if (nyhedData && nyhedData.length > 0) {
    nyhedData.forEach(nyhed => {
      const li = document.createElement('li');
      li.textContent = `Nyhed: ${nyhed.titel}`;
      li.addEventListener('click', () => {
        window.location.href = `nyhed.html?id=${nyhed.id}`;
      });
      suggBox.appendChild(li);
    });
  }
  suggBox.style.display = 'block';
});
document.addEventListener('click', e => {
  if (!e.target.closest('.search-wrapper')) {
    suggBox.style.display = 'none';
  }
});

// SUPABASE DAGENS SPIL
async function hentDagensSpil() {
  try {
    const { data, error } = await supabase
      .from('dagensspil')
      .select('*')
      .order('tidspunkt', { ascending: true });
    const container = document.getElementById('spil-container');
    container.innerHTML = '';
    if (error) throw error;
    if (!data || data.length === 0) {
      container.innerHTML = '<p>Ingen dagens spil tilgængelig.</p>';
      return;
    }
    data.forEach(spil => {
      const kort = document.createElement('div');
      kort.className = 'spil-kort';
      kort.innerHTML = `
        <div class="info-højre">
          <div class="tidspunkt">${spil.tidspunkt ? spil.tidspunkt : ''}</div>
        </div>
        <div class="liga">${spil.liga ? spil.liga : ''}</div>
        <div class="hold-liste">
          <div class="hold">
            ${spil.hold1logo ? `<img src="${spil.hold1logo}" alt="${spil.hold1 || ''} logo" />` : ''}
            <span>${spil.hold1 ? spil.hold1 : ''}</span>
          </div>
          <div class="hold">
            ${spil.hold2logo ? `<img src="${spil.hold2logo}" alt="${spil.hold2 || ''} logo" />` : ''}
            <span>${spil.hold2 ? spil.hold2 : ''}</span>
          </div>
        </div>
        <div class="bund-bjælke">
          <span class="odds">${spil.odds != null ? spil.odds : ''}</span>
          <span class="ekspert">${spil.ekspert ? spil.ekspert : ''}</span>
        </div>
      `;
      container.appendChild(kort);
    });
  } catch (error) {
    console.error('Fejl ved hentning af dagens spil:', error);
    document.getElementById('spil-container').innerText = 'Kunne ikke hente dagens spil.';
  }
}
hentDagensSpil();

// Popup og localStorage kontrol
const popup = document.getElementById('popup');
const closePopupBtn = document.getElementById('closePopup');
const newsletterForm = document.getElementById('newsletterForm');
const emailInput = document.getElementById('emailInput');
const formMessage = document.getElementById('formMessage');
window.addEventListener('load', () => {
  const popupSeen = localStorage.getItem('popupSeen');
  if (!popupSeen) {
    popup.classList.remove('hidden');
  }
});
function closePopup() {
  popup.classList.add('hidden');
  localStorage.setItem('popupSeen', 'true');
}
closePopupBtn.addEventListener('click', closePopup);
newsletterForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = emailInput.value.trim();
  if (!email) {
    alert('Indtast venligst en gyldig email.');
    return;
  }
  // await supabase.from('nyhedsbrev').insert([{ email }]);
  formMessage.textContent = 'Tak for din tilmelding!';
  formMessage.classList.remove('hidden');
  localStorage.setItem('popupSeen', 'true');
  setTimeout(() => {
    closePopup();
  }, 2000);
});

// Dynamisk sidetitel baseret på h1
const h1 = document.querySelector('h1');
const siteName = 'Geo Betting Tips';
if (h1) {
  document.title = `${h1.textContent.trim()} | ${siteName}`;
} else {
  document.title = siteName;
}

// Sæt dagens dato ind i #dagens-dato
function opdaterDagensDato() {
  const nu = new Date();
  // Dansk dato-format: dag. måned år
  const options = { day: 'numeric', month: 'long', year: 'numeric' };
  const danskDato = nu.toLocaleDateString('da-DK', options);
  document.getElementById('dagens-dato').textContent = `(${danskDato})`;
}
opdaterDagensDato();
