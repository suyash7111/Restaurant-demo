/* ==========================================================================
   AURA & EMBER — JAVASCRIPT ANIMATIONS & INTERACTIONS (script.js)
   ========================================================================== */

// Initialize Lucide icons
if (window.lucide) {
  lucide.createIcons();
}

// ==========================================================================
// TABLE AVAILABILITY  ← EDIT THIS SECTION TO MANAGE YOUR BOOKINGS
// ==========================================================================
// All dates use the format 'YYYY-MM-DD'. Times must match the form values:
// '17:30', '19:00', '20:45', '22:00'
const AVAILABILITY = {
  // Weekdays the restaurant is closed every week: 0=Sun 1=Mon 2=Tue 3=Wed 4=Thu 5=Fri 6=Sat
  closedWeekdays: [1],

  // Specific closed dates (holidays, private events)
  closedDates: ['2026-12-25'],

  // Dates where EVERY seating is fully booked
  fullyBookedDates: ['2026-09-26'],

  // Individual seatings that are fully booked on a given date
  fullSlots: {
    '2026-09-20': ['19:00', '20:45'],
    '2026-09-22': ['17:30']
  },

  // Weekdays the Chef's Table (8-10 guests) is offered.
  // All days by default. Example: [4, 5, 6] = Thursday to Saturday only.
  chefsTableWeekdays: [0, 1, 2, 3, 4, 5, 6]
};

// --- Helpers ---------------------------------------------------------------
const WEEKDAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const SHORT_WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const dateInput = document.getElementById('bookingDate');
const bookingTimeSelect = document.getElementById('bookingTime');
const partySizeSelect = document.getElementById('partySize');
const availabilityNotice = document.getElementById('availabilityNotice');

// The seating the guest originally wanted (remembered so we can suggest alternatives)
let desiredTime = '';

// Local-time date string (avoids the UTC shift that toISOString() causes)
function toDateStr(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function parseDateStr(str) {
  const [y, m, d] = str.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function addDays(str, n) {
  const d = parseDateStr(str);
  d.setDate(d.getDate() + n);
  return toDateStr(d);
}

function formatLongDate(str) {
  return `${SHORT_WEEKDAYS[parseDateStr(str).getDay()]}, ${formatBookingDate(str)}`;
}

const tomorrowDate = new Date();
tomorrowDate.setDate(tomorrowDate.getDate() + 1);
const tomorrowStr = toDateStr(tomorrowDate);

// --- Availability rules ----------------------------------------------------
// Returns 'open', 'closed' or 'full' for a whole day
function getDayStatus(dateStr) {
  const weekday = parseDateStr(dateStr).getDay();
  if (AVAILABILITY.closedDates.includes(dateStr) || AVAILABILITY.closedWeekdays.includes(weekday)) {
    return 'closed';
  }
  if (AVAILABILITY.fullyBookedDates.includes(dateStr)) {
    return 'full';
  }
  return 'open';
}

function isSlotFull(dateStr, time) {
  return (AVAILABILITY.fullSlots[dateStr] || []).includes(time);
}

function isChefsTableBlocked(dateStr, party) {
  return party === '8' && !AVAILABILITY.chefsTableWeekdays.includes(parseDateStr(dateStr).getDay());
}

function getAllTimes() {
  return Array.from(bookingTimeSelect.options).map(o => o.value).filter(Boolean);
}

function getOpenSlots(dateStr) {
  if (getDayStatus(dateStr) !== 'open') return [];
  return getAllTimes().filter(t => !isSlotFull(dateStr, t));
}

// Finds the next dates (after fromStr) that can take the booking
function findAlternativeDates(fromStr, { time = '', party = '2', count = 3 } = {}) {
  const found = [];
  for (let i = 1; i <= 90 && found.length < count; i++) {
    const ds = addDays(fromStr, i);
    if (ds < tomorrowStr) continue;
    if (getDayStatus(ds) !== 'open') continue;
    if (isChefsTableBlocked(ds, party)) continue;
    if (time ? isSlotFull(ds, time) : getOpenSlots(ds).length === 0) continue;
    found.push(ds);
  }
  return found;
}

function getDefaultDate() {
  return findAlternativeDates(addDays(tomorrowStr, -1), { count: 1 })[0] || tomorrowStr;
}

// --- Notice box ------------------------------------------------------------
function hideNotice() {
  if (!availabilityNotice) return;
  availabilityNotice.classList.remove('is-visible');
  availabilityNotice.innerHTML = '';
}

function showNotice({ title, text, groups = [] }) {
  if (!availabilityNotice) return;
  const groupsHtml = groups.map(g => `
    <div class="availability-label">${g.label}</div>
    <div class="availability-options">
      ${g.chips.map(c => `<button type="button" class="avail-chip ${c.cls || ''}" data-action="${c.action}" data-value="${c.value || ''}">${c.text}</button>`).join('')}
    </div>`).join('');

  availabilityNotice.innerHTML = `
    <div class="availability-title">${title}</div>
    <div class="availability-text">${text}</div>
    ${groupsHtml}`;
  availabilityNotice.classList.add('is-visible');
}

function dateChips(dates) {
  return dates.map(d => ({ text: formatLongDate(d), action: 'date', value: d }));
}

// --- Main check (runs whenever date / time / party size changes) -------------
function updateAvailability() {
  if (!dateInput || !bookingTimeSelect) return;

  const dateVal = dateInput.value;
  const party = partySizeSelect.value;

  if (!dateVal) {
    hideNotice();
    return;
  }

  const status = getDayStatus(dateVal);
  const chefBlocked = isChefsTableBlocked(dateVal, party);

  // Disable unavailable seatings in the dropdown
  Array.from(bookingTimeSelect.options).forEach(opt => {
    if (!opt.value) return;
    const label = opt.dataset.label || opt.textContent;
    opt.disabled = false;
    opt.textContent = label;
    if (status !== 'open') {
      opt.disabled = true;
      opt.textContent = `${label} (Unavailable)`;
    } else if (isSlotFull(dateVal, opt.value)) {
      opt.disabled = true;
      opt.textContent = `${label} (Fully booked)`;
    }
  });

  // If the chosen seating just became unavailable, remember it and clear it
  const selectedOpt = bookingTimeSelect.selectedOptions[0];
  let slotJustTaken = false;
  if (selectedOpt && selectedOpt.disabled) {
    desiredTime = selectedOpt.value;
    bookingTimeSelect.value = '';
    slotJustTaken = true;
  }

  const waitlistChip = { text: 'Join the waitlist on WhatsApp', action: 'waitlist', cls: 'waitlist' };

  // Case 1: restaurant closed that day
  if (status === 'closed') {
    const dayName = WEEKDAY_NAMES[parseDateStr(dateVal).getDay()];
    const isWeeklyClosure = AVAILABILITY.closedWeekdays.includes(parseDateStr(dateVal).getDay());
    showNotice({
      title: `We're closed on ${formatLongDate(dateVal)}`,
      text: `${isWeeklyClosure ? 'Our hearth rests every ' + dayName + '.' : 'We are closed on this date.'} These are the next dates with a table available:`,
      groups: [{ label: 'Next available dates', chips: dateChips(findAlternativeDates(dateVal, { time: desiredTime, party, count: 4 })) }]
    });
    return;
  }

  // Case 2: every seating is taken that day
  if (status === 'full') {
    showNotice({
      title: `${formatLongDate(dateVal)} is fully booked`,
      text: 'Every seating is taken that day. You can pick another date, or join the waitlist and we will message you if a table opens up.',
      groups: [
        { label: 'Other dates', chips: dateChips(findAlternativeDates(dateVal, { time: desiredTime, party, count: 4 })) },
        { label: 'Or', chips: [waitlistChip] }
      ]
    });
    return;
  }

  // Case 3: Chef's Table not offered on that weekday
  if (chefBlocked) {
    const offered = AVAILABILITY.chefsTableWeekdays.map(d => WEEKDAY_NAMES[d] + 's').join(', ');
    showNotice({
      title: `Chef's Table isn't offered on ${WEEKDAY_NAMES[parseDateStr(dateVal).getDay()]}s`,
      text: `The Chef's Table (8-10 guests) is available on: ${offered}. Choose one of those dates, or book a smaller table.`,
      groups: [
        { label: 'Next Chef\'s Table dates', chips: dateChips(findAlternativeDates(dateVal, { time: desiredTime, party: '8', count: 4 })) },
        { label: 'Or', chips: [{ text: 'Book for 6 guests instead', action: 'party', value: '6' }] }
      ]
    });
    return;
  }

  // Case 4: the guest's chosen seating is fully booked (day itself is open)
  if (slotJustTaken) {
    const slots = getOpenSlots(dateVal).map(t => ({ text: formatBookingTime(t), action: 'time', value: t }));
    const groups = [];
    if (slots.length) groups.push({ label: `Other seatings on ${formatBookingDate(dateVal)}`, chips: slots });
    const sameTimeDates = findAlternativeDates(dateVal, { time: desiredTime, party, count: 3 });
    if (sameTimeDates.length) groups.push({ label: `${formatBookingTime(desiredTime)} on other dates`, chips: dateChips(sameTimeDates) });
    groups.push({ label: 'Or', chips: [waitlistChip] });

    showNotice({
      title: `${formatBookingTime(desiredTime)} is fully booked on ${formatBookingDate(dateVal)}`,
      text: 'Sorry about that! Here are some ways to still get you a table:',
      groups
    });
    return;
  }

  hideNotice();
}

// Clicks on the suggestion buttons inside the notice
if (availabilityNotice) {
  availabilityNotice.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const { action, value } = btn.dataset;

    if (action === 'time') {
      bookingTimeSelect.value = value;
      desiredTime = value;
    } else if (action === 'date') {
      dateInput.value = value;
      if (desiredTime && getDayStatus(value) === 'open' && !isSlotFull(value, desiredTime)) {
        bookingTimeSelect.value = desiredTime;
      }
    } else if (action === 'party') {
      partySizeSelect.value = value;
    } else if (action === 'waitlist') {
      sendWaitlistRequest();
      return;
    }
    updateAvailability();
  });
}

// Waitlist request straight to the manager's WhatsApp
function sendWaitlistRequest() {
  const nameEl = document.getElementById('guestName');
  const phoneEl = document.getElementById('guestPhone');
  // Ask the guest to fill in name + phone first (shows the browser's "required" bubble)
  if (!nameEl.reportValidity() || !phoneEl.reportValidity()) return;

  const email = document.getElementById('guestEmail').value.trim();
  const timeText = desiredTime ? `at ${formatBookingTime(desiredTime)}` : '(any seating time)';

  let message =
    `Hello Aura & Ember! ${formatBookingDate(dateInput.value)} ${timeText} for ` +
    `${getGuestsText(partySizeSelect.value)} is fully booked on your website. ` +
    `Could you please add me to the waitlist in case a table opens up?` +
    `\n\nName: ${nameEl.value.trim()}\nContact: ${phoneEl.value.trim()}${email ? ' | ' + email : ''}`;

  openWhatsApp(message);
}

// --- Init ---------------------------------------------------------------------
if (bookingTimeSelect) {
  Array.from(bookingTimeSelect.options).forEach(o => { o.dataset.label = o.textContent; });
  bookingTimeSelect.addEventListener('change', () => {
    if (bookingTimeSelect.value) desiredTime = bookingTimeSelect.value;
    updateAvailability();
  });
}
if (partySizeSelect) partySizeSelect.addEventListener('change', updateAvailability);
if (dateInput) {
  dateInput.min = tomorrowStr;
  dateInput.value = getDefaultDate();   // first open date from tomorrow onwards
  dateInput.addEventListener('change', updateAvailability);
  dateInput.addEventListener('input', updateAvailability);
}
updateAvailability();

// Interactive Warm Glow Follower (requestAnimationFrame loop)
const cursorGlow = document.getElementById('cursorGlow');
let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;
let currentX = mouseX;
let currentY = mouseY;

window.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
});

function animateCursor() {
  currentX += (mouseX - currentX) * 0.12;
  currentY += (mouseY - currentY) * 0.12;
  if (cursorGlow) {
    cursorGlow.style.left = `${currentX}px`;
    cursorGlow.style.top = `${currentY}px`;
  }
  requestAnimationFrame(animateCursor);
}
animateCursor();

// Sticky Navbar background blur on scroll
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  if (window.scrollY > 40) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
}, { passive: true });

// Smooth Reveal Observer for cutouts and elements
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
    }
  });
}, {
  threshold: 0.12,
  rootMargin: '0px 0px -50px 0px'
});

document.querySelectorAll('.reveal-elem').forEach((el) => {
  revealObserver.observe(el);
});

// Interactive Menu Filtering
function filterMenu(category) {
  const tabs = document.querySelectorAll('.tab-btn');
  tabs.forEach(tab => tab.classList.remove('active'));
  event.currentTarget.classList.add('active');

  const items = document.querySelectorAll('.menu-item-card');
  items.forEach(item => {
    const itemCat = item.getAttribute('data-cat');
    if (category === 'all' || itemCat === category) {
      item.style.display = 'flex';
      setTimeout(() => {
        item.style.opacity = '1';
        item.style.transform = 'translateY(0)';
      }, 50);
    } else {
      item.style.opacity = '0';
      item.style.transform = 'translateY(15px)';
      setTimeout(() => {
        item.style.display = 'none';
      }, 300);
    }
  });
}

// ==========================================================================
// INSTANT WHATSAPP RESERVATION NOTIFICATION
// ==========================================================================
// >>> CHANGE THIS to the restaurant manager's WhatsApp number.
// Digits only, with country code, no "+", spaces or dashes.
// Example: India 98765 43210  ->  '919876543210'
const RESTAURANT_WHATSAPP = '919876543210';

// "2026-09-20" -> "Sept 20" (built manually to avoid timezone shifts)
function formatBookingDate(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const months = ['Jan', 'Feb', 'March', 'April', 'May', 'June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
  return `${months[m - 1]} ${d}`;
}

// "19:00" -> "7:00 PM"
function formatBookingTime(timeStr) {
  const [h, min] = timeStr.split(':').map(Number);
  const suffix = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(min).padStart(2, '0')} ${suffix}`;
}

function getGuestsText(partyVal) {
  return partyVal === '8' ? "8-10 Guests (Chef's Table)" : `${partyVal} Guests`;
}

// Opens WhatsApp (phone app or WhatsApp Web) with a pre-filled message
function openWhatsApp(message) {
  const url = `https://wa.me/${RESTAURANT_WHATSAPP}?text=${encodeURIComponent(message)}`;
  const win = window.open(url, '_blank', 'noopener');
  if (!win) {
    // Popup blocked -> open in the same tab instead
    window.location.href = url;
  }
}

// Reservation Form Submission Handler
function handleBooking(e) {
  e.preventDefault();

  // 1. Read the form values
  const name     = document.getElementById('guestName').value.trim();
  const email    = document.getElementById('guestEmail').value.trim();
  const phone    = document.getElementById('guestPhone').value.trim();
  const dateVal  = document.getElementById('bookingDate').value;
  const timeVal  = document.getElementById('bookingTime').value;
  const partyVal = document.getElementById('partySize').value;
  const requests = document.getElementById('specialRequests').value.trim();

  // 2. Safety check: never send a request for a table that isn't available
  if (
    getDayStatus(dateVal) !== 'open' ||
    isSlotFull(dateVal, timeVal) ||
    isChefsTableBlocked(dateVal, partyVal)
  ) {
    desiredTime = timeVal;
    updateAvailability();
    availabilityNotice.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }

  // 3. Build the pre-filled WhatsApp message
  let message =
    `Hello Aura & Ember! I would like to reserve a table for ${getGuestsText(partyVal)} ` +
    `on ${formatBookingDate(dateVal)} at ${formatBookingTime(timeVal)} ` +
    `under the name ${name}.`;

  message += `\n\nContact: ${phone} | ${email}`;
  if (requests) {
    message += `\nSpecial requests: ${requests}`;
  }

  // 4. Open WhatsApp
  openWhatsApp(message);

  // 5. Show the on-page confirmation and reset the form
  const toast = document.getElementById('bookingSuccess');
  toast.style.display = 'block';
  if (window.lucide) {
    lucide.createIcons();
  }
  e.target.reset();

  // reset() clears the date and time, so restore the default and re-check availability
  desiredTime = '';
  dateInput.value = getDefaultDate();
  updateAvailability();
  toast.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// ==========================================================================
// REAL COZY RESTAURANT PIANO SOUNDTRACK PLAYER
// ==========================================================================
const bgMusic = document.getElementById('bgMusic');
const ambienceBtn = document.getElementById('ambienceBtn');
const ambienceText = document.getElementById('ambienceText');

if (ambienceBtn && bgMusic) {
  bgMusic.volume = 0.55;

  ambienceBtn.addEventListener('click', () => {
    if (bgMusic.paused) {
      const playPromise = bgMusic.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {
          ambienceBtn.classList.add('ambience-active');
          ambienceText.textContent = 'Hearth Ambience: Playing ♪';
        }).catch(error => {
          console.warn('Browser blocked audio:', error);
          ambienceText.textContent = 'Tap to allow sound';
        });
      }
    } else {
      bgMusic.pause();
      ambienceBtn.classList.remove('ambience-active');
      ambienceText.textContent = 'Hearth Fire Ambience';
    }
  });

  bgMusic.addEventListener('pause', () => {
    ambienceBtn.classList.remove('ambience-active');
    ambienceText.textContent = 'Hearth Fire Ambience';
  });
}
