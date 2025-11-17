// Barcha video ma'lumotlari (YouTube embed linklari va sarlavhalari)
const lessons = [
    { 
        id: 1,
        title: "1-dars",
        videoId: "jXRvqhDJrNY",  // hozirgi video
        text: "Mavzu: Salomlashish"
    },
    { 
        id: 2,
        title: "2-dars",
        videoId: "9GyJr-nF7Wc",  // misol uchun Rick Roll :)
        text: "Mavzu: O'zini tanishtirish"
    },
    { 
        id: 3,
        title: "3-dars",
        videoId: "KMyV7SfYzrM",
        text: "Mavzu: Oddiy savol va javoblar"
    },
    { 
        id: 4,
        title: "4-dars",
        videoId: "rgJRFBoj234",
        text: "Mavzu: O'zini tanishtirish - 2"
    },
    { 
        id: 5,
        title: "5-dars",
        videoId: "vo-SUd-CkKM",
        text: "Mavzu: Oila a'zolarini tanishtirish"
    },
    { 
        id: 6,
        title: "6-dars",
        videoId: "3QE2aN2yZt8",
        text: "Mavzu: Oila a'zolarini tanishtirish - 2"
    },
    { 
        id: 7,
        title: "7-dars",
        videoId: "mTazF2D6NDM",
        text: "Mavzu: Dialogue - Suhbat"
    },
    { 
        id: 8,
        title: "8-dars",
        videoId: "Z38iPpGif44",
        text: "Mavzu: Tashqi qiyofani tasvirlash"
    },
    { 
        id: 9,
        title: "9-dars",
        videoId: "F2Nf509yIwg",
        text: "Mavzu: Tashqi qiyofani tasvirlash - 2"
    },
    { 
        id: 10,
        title: "10-dars",
        videoId: "mqY_6YK5P0A",
        text: "Mavzu: Tashqi qiyofani tasvirlash"
    }
];

// DOM elementlarini olish
const iframe = document.querySelector(".english-video iframe");
const lessonText = document.querySelector(".e-video-text p");
const buttons = document.querySelectorAll(".e-video-list-buttons button");

// Har bir tugmaga click hodisasini qo'shamiz
buttons.forEach(button => {
    button.addEventListener("click", function () {
        // Bosilgan tugmaning raqamini aniqlash (masalan: "3-dars" → 3)
        const buttonText = this.textContent.trim(); // "3-dars"
        const lessonNumber = parseInt(buttonText.split("-")[0]); // 3

        // Kerakli darsni topamiz
        const selectedLesson = lessons.find(lesson => lesson.id === lessonNumber);

        if (selectedLesson) {
            // iframe src ni yangi video bilan almashtirish
            iframe.src = `https://www.youtube.com/embed/${selectedLesson.videoId}?si=7jw7yGZ1J-Nr-a0C`;

            // Pastdagi matnni o'zgartirish
            lessonText.textContent = selectedLesson.text;

            // Faol tugmani ko'rsatish uchun "active" klass qo'shamiz
            buttons.forEach(btn => btn.classList.remove("active"));
            this.classList.add("active");
        }
    });
});

// Sahifa yuklanganda birinchi darsni faol qilib ko'rsatamiz
document.addEventListener("DOMContentLoaded", function () {
    buttons[0].classList.add("active"); // 1-dars tugmasi faol bo'ladi
});