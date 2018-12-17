const defaultSettings = {
  nav: {
    prev: ".prev",
    next: ".next",
    active: true
  },
  bullets: {
    active: false
  },
  auto: {
    active: false,
    delay: 3000
  },
  speed: 3000,
  show: 1
};

class Slider {
  constructor(selector, params) {
    this.selector = document.querySelector(selector);
    this.totalSlides = this.selector.children.length;
    this.params = {
      ...defaultSettings,
      ...params
    };
    this.currentSlideIndex = this.selector.children.length;
    this.navStatus = this.params.nav.active;
    this.bulletStatus = this.params.bullets.active;
    this.autoSliderStatus = this.params.auto.active;
    this.speed = this.params.speed;
    this.SlidesQuantity = this.params.show;
    this.autoSliderDelay = this.params.auto.delay;
    this.bullets;
    this.timer;
    this.bulletActiveClass = "swiper-pagination-bullet-active";
    this.bulletsQuantity = 0;
    this.offSet = 0;
    this.containerWidth = this.selector.parentNode.offsetWidth;
    this.init();
  }

  init() {
    this.initNavigation();
    this.initiateBullets();
    this.setWidth();
    this.initAutoPlay();
    this.initResizeHandler();
  }

  get mainContainerWidth() {
    return this.selector.parentNode.offsetWidth;
  }

  setWidth() {
    this.containerWidth = this.containerWidth / this.SlidesQuantity;
    for (let i = 0; i < this.selector.children.length; i++) {
      this.selector.children[i].setAttribute(
        "style",
        `width:${this.containerWidth}px`
      );
    }
  }

  initResizeHandler() {
    window.addEventListener("resize", () => {
      this.containerWidth = this.mainContainerWidth;
      this.offSet =
        this.containerWidth * this.totalSlides -
        this.currentSlideIndex * this.containerWidth;
      this.selector.setAttribute(
        "style",
        `transition-duration: ${this.speed}ms; transform: translateX(-${
          this.offSet
        }px)`
      );
      this.setWidth();
    });
  }

  initNavigation() {
    const { active } = this.params.nav;
    if (active) {
      if (this.params.nav.next) {
        document
          .querySelector(this.params.nav.next)
          .addEventListener("click", () => {
            this.resetAutoPlay();
            this.next();
          });
      }
      if (this.params.nav.prev) {
        document
          .querySelector(this.params.nav.prev)
          .addEventListener("click", () => {
            this.resetAutoPlay();
            this.previous();
          });
      }
    }
  }

  initiateBullets() {
    if (this.bulletStatus) {
      this.initBullets();
    }
  }

  next() {
    if (this.offSet < this.containerWidth * (this.totalSlides - 1)) {
      this.currentSlideIndex--;
      this.removeActiveClass();
      this.addActiveClass();
      this.offSet =
        this.containerWidth * this.totalSlides -
        this.currentSlideIndex * this.containerWidth;

      this.transformSetter();
    }
  }

  previous() {
    if (this.offSet > 0) {
      this.currentSlideIndex++;
      this.removeActiveClass();
      this.addActiveClass();
      this.offSet =
        this.containerWidth * this.totalSlides -
        this.currentSlideIndex * this.containerWidth;
      this.transformSetter();
    }
  }

  transformSetter() {
    if (this.SlidesQuantity > 1) {
      this.offSet = this.offSet * this.SlidesQuantity;
    }

    this.selector.setAttribute(
      "style",
      `transition-duration: ${this.speed}ms; transform: translateX(-${
        this.offSet
      }px)`
    );
  }

  initAutoPlay() {
    if (this.autoSliderStatus) {
      this.bulletClickHandler();
      this.timer = setInterval(() => {
        if (
          this.SlidesQuantity > 1 &&
          // When 'this.offSet' gets bigger then the sum of slides width , we return back to the first slide
          this.offSet >= this.containerWidth * (this.totalSlides - 1)
        ) {
          // Since count starts from second slide +1 is used to make the loop complete
          this.currentSlideIndex = this.totalSlides + 1;
          // Return to starting position
          this.offSet = 0;
        } else if (this.currentSlideIndex === 1) {
          // Add 1 to prevent last slide from falling out of the cycle
          this.currentSlideIndex = this.totalSlides + 1;
          this.offSet = 0;
        }
        this.next();
      }, this.autoSliderDelay);
    } else {
      this.bulletClickHandler();
    }
  }

  stopAutoPlay() {
    clearInterval(this.timer);
  }

  resetAutoPlay() {
    this.stopAutoPlay();
    this.initAutoPlay();
  }

  initBullets() {
    let newNode = document.createElement("div");
    newNode.classList.add("swiper-pagination");
    for (let i = 0; i < this.totalSlides / this.SlidesQuantity; i++) {
      ++this.bulletsQuantity;
      newNode.innerHTML =
        newNode.innerHTML +
        `<button class="swiper-pagination-bullet ${
          i === 0 ? this.bulletActiveClass : ""
        }" data-index="${this.totalSlides - i}">&nbsp</button>`;
    }
    document
      .querySelector(`.${this.selector.parentNode.className}`)
      .appendChild(newNode);
    this.bullets = newNode;
  }

  removeActiveClass() {
    if (this.bulletStatus) {
      this.bullets.childNodes.forEach(bullet => {
        bullet.classList.remove(this.bulletActiveClass);
      });
    }
  }

  addActiveClass() {
    if (this.bulletStatus) {
      this.bullets.childNodes.forEach(bullet => {
        if (
          parseInt(bullet.getAttribute("data-index"), 10) ===
          this.currentSlideIndex
        ) {
          bullet.classList.add(this.bulletActiveClass);
        }
      });
    }
  }

  bulletClickHandler() {
    if (this.bulletStatus) {
      this.bullets.childNodes.forEach(bullet => {
        bullet.addEventListener("click", e => {
          e.preventDefault();
          const bullet = e.target;
          const currentSlideIndex = parseInt(
            bullet.getAttribute("data-index"),
            10
          );
          this.removeActiveClass();
          this.resetAutoPlay();
          this.offSet =
            this.containerWidth * this.totalSlides -
            currentSlideIndex * this.containerWidth;
          this.transformSetter();
          this.currentSlideIndex = currentSlideIndex;
          bullet.classList.add(this.bulletActiveClass);
        });
      });
    }
  }
}

// 2. Resize event. Slides with wrong sizes
