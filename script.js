/* ================= NAVBAR ================= */

const navbar = document.getElementById("navbar");
const mobileMenu = document.getElementById("mobileMenu");
const mainNav = document.getElementById("mainNav");


window.addEventListener("scroll", () => {

    if (window.scrollY > 60) {
        navbar.classList.add("scrolled");
    } else {
        navbar.classList.remove("scrolled");
    }

});


/* ================= MOBILE MENU ================= */

mobileMenu.addEventListener("click", () => {

    navbar.classList.toggle("mobile-open");

});


document.querySelectorAll("#mainNav a").forEach(link => {

    link.addEventListener("click", () => {

        navbar.classList.remove("mobile-open");

    });

});


/* ================= SCROLL REVEAL ================= */

const revealObserver = new IntersectionObserver(
    entries => {

        entries.forEach(entry => {

            if (entry.isIntersecting) {

                entry.target.classList.add("visible");

                revealObserver.unobserve(entry.target);

            }

        });

    },
    {
        threshold: 0.12
    }
);


document.querySelectorAll(".reveal").forEach(element => {

    revealObserver.observe(element);

});


/* ================= MENU DATA ================= */

const menuData = {

    tasting: [

        {
            name: "Forest Mushroom",
            description: "Wild mushroom · roasted garlic · black truffle",
            price: "₹1,250"
        },

        {
            name: "Charred Asparagus",
            description: "Hazelnut · aged parmesan · preserved lemon",
            price: "₹950"
        },

        {
            name: "Herb Crusted Sea Bass",
            description: "Seasonal vegetables · champagne sauce",
            price: "₹1,850"
        },

        {
            name: "Truffle Risotto",
            description: "Arborio · black truffle · aged parmesan",
            price: "₹1,450"
        },

        {
            name: "Dark Chocolate",
            description: "72% cacao · sea salt · vanilla",
            price: "₹850"
        }

    ],


    alacarte: [

        {
            name: "Roasted Lamb",
            description: "Garden herbs · seasonal vegetables · jus",
            price: "₹1,950"
        },

        {
            name: "Wild Sea Bass",
            description: "Champagne sauce · asparagus · herbs",
            price: "₹1,850"
        },

        {
            name: "Truffle Risotto",
            description: "Arborio · black truffle · parmesan",
            price: "₹1,450"
        },

        {
            name: "Heritage Tomato",
            description: "Basil · burrata · aged balsamic",
            price: "₹950"
        }

    ],


    dessert: [

        {
            name: "Vanilla Soufflé",
            description: "Madagascar vanilla · crème anglaise",
            price: "₹750"
        },

        {
            name: "Dark Chocolate",
            description: "72% chocolate · sea salt · vanilla",
            price: "₹850"
        },

        {
            name: "Seasonal Tart",
            description: "Fresh fruit · almond cream · sorbet",
            price: "₹700"
        }

    ],


    wine: [

        {
            name: "Champagne Brut",
            description: "France · elegant · crisp · mineral",
            price: "₹2,800"
        },

        {
            name: "Sauvignon Blanc",
            description: "New Zealand · citrus · fresh herbs",
            price: "₹1,500"
        },

        {
            name: "Pinot Noir",
            description: "France · red fruit · delicate spice",
            price: "₹1,900"
        }

    ]

};


const menuList = document.getElementById("menuList");


function loadMenu(category) {

    menuList.style.opacity = "0";

    setTimeout(() => {

        menuList.innerHTML = "";

        menuData[category].forEach(item => {

            const dish = document.createElement("div");

            dish.className = "dish";

            dish.innerHTML = `
                <div>
                    <h3>${item.name}</h3>
                    <p>${item.description}</p>
                </div>

                <strong class="dish-price">
                    ${item.price}
                </strong>
            `;

            menuList.appendChild(dish);

        });

        menuList.style.opacity = "1";

    }, 180);

}


/* Initial menu */

loadMenu("tasting");


/* Menu tabs */

document.querySelectorAll(".menu-tab").forEach(tab => {

    tab.addEventListener("click", () => {

        document
            .querySelectorAll(".menu-tab")
            .forEach(button => {
                button.classList.remove("active");
            });


        tab.classList.add("active");


        const category = tab.dataset.menu;

        loadMenu(category);

    });

});


/* ================= GALLERY ================= */

const galleryImages = Array.from(
    document.querySelectorAll(".gallery-item img")
);


const lightbox = document.getElementById("lightbox");
const lightboxImage = document.getElementById("lightboxImage");

const closeLightbox =
    document.getElementById("lightboxClose");

const previousImage =
    document.getElementById("lightboxPrev");

const nextImage =
    document.getElementById("lightboxNext");


let currentImage = 0;


galleryImages.forEach((image, index) => {

    image.parentElement.addEventListener("click", () => {

        currentImage = index;

        showGalleryImage();

        lightbox.classList.add("show");

        document.body.classList.add("no-scroll");

    });

});


function showGalleryImage() {

    lightboxImage.src =
        galleryImages[currentImage].src;

}


function closeGallery() {

    lightbox.classList.remove("show");

    document.body.classList.remove("no-scroll");

}


closeLightbox.addEventListener("click", closeGallery);


nextImage.addEventListener("click", event => {

    event.stopPropagation();

    currentImage++;

    if (currentImage >= galleryImages.length) {
        currentImage = 0;
    }

    showGalleryImage();

});


previousImage.addEventListener("click", event => {

    event.stopPropagation();

    currentImage--;

    if (currentImage < 0) {
        currentImage = galleryImages.length - 1;
    }

    showGalleryImage();

});


lightbox.addEventListener("click", event => {

    if (event.target === lightbox) {
        closeGallery();
    }

});


document.addEventListener("keydown", event => {

    if (!lightbox.classList.contains("show")) {
        return;
    }


    if (event.key === "Escape") {
        closeGallery();
    }


    if (event.key === "ArrowRight") {
        nextImage.click();
    }


    if (event.key === "ArrowLeft") {
        previousImage.click();
    }

});


/* ================= RESERVATION ================= */

const bookingSteps =
    document.querySelectorAll(".booking-step");

const experienceOptions =
    document.querySelectorAll(".experience-option");

const timeButtons =
    document.querySelectorAll(".time-grid button");

const confirmBooking =
    document.getElementById("confirmBooking");


let currentStep = 1;

let selectedExperience = "";

let selectedTime = "";


/* Minimum date */

const dateInput =
    document.getElementById("bookingDate");


const today =
    new Date();


const year =
    today.getFullYear();


const month =
    String(today.getMonth() + 1).padStart(2, "0");


const day =
    String(today.getDate()).padStart(2, "0");


const todayString =
    `${year}-${month}-${day}`;


dateInput.min = todayString;


/* Show booking step */

function showBookingStep(step) {

    currentStep = step;


    bookingSteps.forEach(section => {

        section.classList.remove("active");

        if (
            Number(section.dataset.step) === step
        ) {

            section.classList.add("active");

        }

    });

}


/* Continue buttons */

document.querySelectorAll(".next-btn").forEach(button => {

    button.addEventListener("click", () => {


        /* STEP 1 */

        if (currentStep === 1) {

            const date =
                dateInput.value;


            if (!date) {

                alert("Please select a date.");

                return;

            }


            const selectedDate =
                new Date(date + "T00:00:00");


            const currentDate =
                new Date();


            currentDate.setHours(0, 0, 0, 0);


            if (selectedDate < currentDate) {

                alert("Please select a future date.");

                return;

            }

        }


        /* STEP 2 */

        if (
            currentStep === 2 &&
            !selectedExperience
        ) {

            alert(
                "Please choose your dining experience."
            );

            return;

        }


        /* STEP 3 */

        if (
            currentStep === 3 &&
            !selectedTime
        ) {

            alert("Please select a time.");

            return;

        }


        showBookingStep(currentStep + 1);

    });

});


/* ================= EXPERIENCE SELECTION ================= */

experienceOptions.forEach(option => {

    option.addEventListener("click", () => {

        experienceOptions.forEach(item => {

            item.classList.remove("selected");

        });


        option.classList.add("selected");


        selectedExperience =
            option
                .querySelector("strong")
                .textContent;

    });

});


/* ================= TIME SELECTION ================= */

timeButtons.forEach(button => {

    button.addEventListener("click", () => {

        timeButtons.forEach(item => {

            item.classList.remove("selected");

        });


        button.classList.add("selected");


        selectedTime =
            button.textContent.trim();

    });

});


/* ================= CONFIRM RESERVATION ================= */

confirmBooking.addEventListener("click", () => {

    const name =
        document
            .getElementById("guestName")
            .value
            .trim();


    const phone =
        document
            .getElementById("guestPhone")
            .value
            .trim();


    const email =
        document
            .getElementById("guestEmail")
            .value
            .trim();


    const date =
        dateInput.value;


    const guests =
        document
            .getElementById("guestCount")
            .value;


    /* Validate name */

    if (!name) {

        alert("Please enter your name.");

        return;

    }


    /* Validate phone */

    if (!phone) {

        alert("Please enter your mobile number.");

        return;

    }


    /* Validate email */

    if (!email) {

        alert("Please enter your email address.");

        return;

    }


    const emailPattern =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


    if (!emailPattern.test(email)) {

        alert("Please enter a valid email address.");

        return;

    }


    /* Display confirmation */

    document.getElementById("successName")
        .textContent = name;


    document.getElementById("successDate")
        .textContent = formatDate(date);


    document.getElementById("successGuests")
        .textContent = guests + " Guests";


    document.getElementById("successTime")
        .textContent = selectedTime;


    /* Generate reservation ID */

    const reservationID =
        "ME-" +
        Math.floor(
            10000 + Math.random() * 90000
        );


    document.getElementById("reservationId")
        .textContent = reservationID;


    /* Hide booking steps */

    bookingSteps.forEach(step => {

        step.style.display = "none";

    });


    /* Show success */

    document.querySelector(".booking-success")
        .style.display = "block";


    document.querySelector(".booking-card")
        .scrollIntoView({
            behavior: "smooth",
            block: "center"
        });

});


/* ================= DATE FORMAT ================= */

function formatDate(dateString) {

    const date =
        new Date(dateString + "T00:00:00");


    return date.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );

}


/* ================= GOOGLE CALENDAR ================= */

document
    .getElementById("calendarBtn")
    .addEventListener("click", () => {


        const date =
            dateInput.value;


        const name =
            document
                .getElementById("guestName")
                .value;


        if (!date) {

            alert("Reservation date is missing.");

            return;

        }


        const formattedDate =
            date.replaceAll("-", "");


        const start =
            formattedDate + "T180000";


        const end =
            formattedDate + "T213000";


        const url =
            `https://calendar.google.com/calendar/render?action=TEMPLATE&text=Maison%20Élan%20Reservation&dates=${start}/${end}&details=Reservation%20for%20${encodeURIComponent(name)}&location=Pune%2C%20Maharashtra`;


        window.open(
            url,
            "_blank"
        );

    });


/* ================= TESTIMONIAL SLIDER ================= */

const testimonials =
    document.querySelectorAll(".testimonial");


const dots =
    document.querySelectorAll(
        ".slider-dots button"
    );


let testimonialIndex = 0;


function showTestimonial(index) {

    testimonials.forEach(item => {

        item.classList.remove("active");

    });


    dots.forEach(dot => {

        dot.classList.remove("active");

    });


    testimonials[index]
        .classList.add("active");


    dots[index]
        .classList.add("active");

}


dots.forEach((dot, index) => {

    dot.addEventListener("click", () => {

        testimonialIndex = index;

        showTestimonial(
            testimonialIndex
        );

    });

});


setInterval(() => {

    testimonialIndex++;


    if (
        testimonialIndex >=
        testimonials.length
    ) {

        testimonialIndex = 0;

    }


    showTestimonial(
        testimonialIndex
    );

}, 5000);
