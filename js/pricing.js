const servicePrices = {
  // ========================================
  // SERVICE WASH
  // ========================================
  "service-wash": {
    title: "Service Wash",
    description: "Wash, dry and fold. Powder and softener included.",
    prices: [
      { name: "2kg or less (W+D+F)", price: "€13.05", unit: "kg" },
      { name: "3kg - 4kg (W+D+F)", price: "€15.65", unit: "kg" },
      { name: "5kg - 6kg (W+D+F)", price: "€18.25", unit: "kg" },
      { name: "7kg - 8kg (W+D+F)", price: "€22.90", unit: "kg" },
      { name: "9kg - 10kg (W+D+F)", price: "€28.00", unit: "kg" },
      { name: "11kg - 12kg (W+D+F)", price: "€31.35", unit: "kg" },
      { name: "13kg - 14kg (W+D+F)", price: "€35.15", unit: "kg" },
      { name: "15kg - 16kg (W+D+F)", price: "€40.50", unit: "kg" },
      { name: "17kg - 18kg (W+D+F)", price: "€43.10", unit: "kg" },
      { name: "19kg - 20kg (W+D+F)", price: "€47.60", unit: "kg" },
      { name: "21kg - 22kg (W+D+F)", price: "€52.85", unit: "kg" },

      { name: "2 Kg - 6 Kg (Wash Only)", price: "€10.30", unit: "kg" },
      { name: "6 Kg - 10 Kg (Wash Only)", price: "€12.15", unit: "kg" },
      { name: "10 Kg - 14 Kg (Wash Only)", price: "€13.70", unit: "kg" },

      { name: "7kg or less (D+F)", price: "€10.00", unit: "kg" },
      { name: "8 Kg - 12 Kg (D+F)", price: "€14.00", unit: "kg" },
      { name: "13 Kg - 16 Kg (D+F)", price: "€17.85", unit: "kg" },
      { name: "17 Kg - 20 Kg (D+F)", price: "€22.85", unit: "kg" },
      { name: "21 Kg - 24 Kg (D+F)", price: "€26.15", unit: "kg" },
      { name: "25 Kg - 28 Kg (D+F)", price: "€31.35", unit: "kg" },
    ],
  },

  // ========================================
  // IRONING SERVICES
  // ========================================
  ironing: {
    title: "Ironing Services",
    description: "Professional ironing, pressing and wash & iron services.",
    prices: [
      // ------------------------------
      // WASH & IRON
      // ------------------------------
      {
        name: "5 Shirts Special (Wash & Iron)",
        price: "€16.25",
        unit: "per item",
      },
      {
        name: "T-Shirt (Wash & Iron)",
        price: "€3.90",
        unit: "per item",
      },
      {
        name: "Trousers Crease (Wash & Iron)",
        price: "€6.50",
        unit: "per item",
        popular: true,
      },
      {
        name: "Jeans (Wash & Iron)",
        price: "€6.05",
        unit: "per item",
      },
      {
        name: "Shorts (Wash & Iron)",
        price: "€6.50",
        unit: "per item",
      },
      {
        name: "Skirt (Wash & Iron)",
        price: "€8.95",
        unit: "from",
      },
      {
        name: "Dress Short (Wash & Iron)",
        price: "€11.40",
        unit: "per item",
      },
      {
        name: "Dress Long (Wash & Iron)",
        price: "€13.05",
        unit: "per item",
      },
      {
        name: "Tops/ T-shirts (Wash & Iron)",
        price: "€3.90",
        unit: "per item",
      },
      {
        name: "Pyjama Sets (Wash & Iron)",
        price: "€7.50",
        unit: "per item",
      },
      {
        name: "Jacket (Wash & Iron)",
        price: "€7.85",
        unit: "per item",
      },
      {
        name: "Apron (Wash & Iron)",
        price: "€2.25",
        unit: "per item",
      },

      // ------------------------------
      // IRON ONLY
      // ------------------------------
      {
        name: "10 Shirt Special (Iron Only)",
        price: "€26.50",
        unit: "per item",
      },
      {
        name: "Shirt (Iron Only)",
        price: "€3.30",
        unit: "per item",
      },
      {
        name: "Shirt - FOLD (Iron Only)",
        price: "€3.65",
        unit: "per item",
      },
      {
        name: "Trousers - Crease (Iron Only)",
        price: "€4.95",
        unit: "per item",
      },
      {
        name: "Jeans (Iron Only)",
        price: "€4.60",
        unit: "per item",
      },
      {
        name: "Shorts (Iron Only)",
        price: "€5.25",
        unit: "per item",
      },
      {
        name: "Skirt (Iron Only)",
        price: "€5.25",
        unit: "per item",
      },
      {
        name: "Skirt Long (Iron Only)",
        price: "€6.05",
        unit: "per item",
      },
      {
        name: "Dress Short (Iron Only)",
        price: "€9.80",
        unit: "per item",
      },
      {
        name: "Dress Long (Iron Only)",
        price: "€11.75",
        unit: "per item",
      },
      {
        name: "Top/T-shirts (Iron Only)",
        price: "€2.70",
        unit: "per item",
      },
      {
        name: "Pyjama Sets (Iron Only)",
        price: "€5.50",
        unit: "per item",
      },
      {
        name: "Jacket (Iron Only)",
        price: "€5.60",
        unit: "per item",
      },
      {
        name: "Apron (Iron Only)",
        price: "€2.00",
        unit: "per item",
      },
      {
        name: "Table Cloth (Iron Only)",
        price: "€7.50",
        unit: "per item",
      },
    ],
  },

  "dry-cleaning": {
    title: "Dry Cleaning (Special Care)",
    description:
      "Professional dry cleaning for delicate and special-care garments.",
    prices: [
      {
        name: "2 Piece Suit (Dry Cleaning)",
        price: "€22.40",
        unit: "per item",
      },
      {
        name: "3 Piece Suit (Dry Cleaning)",
        price: "€25.20",
        unit: "per item",
      },
      {
        name: "Trousers (Dry Cleaning)",
        price: "€12.85",
        unit: "per item",
      },
      {
        name: "Coat (Dry Cleaning)",
        price: "From €20.95",
        unit: "from",
      },
      {
        name: "Shirt (Dry Cleaning)",
        price: "€7.40",
        unit: "per item",
      },
      {
        name: "Jacket (Dry Cleaning)",
        price: "From €16.25",
        unit: "from",
      },
      {
        name: "Tie (Dry Cleaning)",
        price: "€6.75",
        unit: "per item",
      },
      {
        name: "Knitwear (Dry Cleaning)",
        price: "€11.70",
        unit: "per item",
      },
      {
        name: "Dress (Dry Cleaning)",
        price: "From €20.95",
        unit: "from",
      },
      {
        name: "Scarf (Dry Cleaning)",
        price: "€10.95",
        unit: "per item",
      },
      {
        name: "Skirt (Dry Cleaning)",
        price: "From €14.15",
        unit: "from",
      },
      {
        name: "Wedding Dress (Dry Cleaning)",
        price: "From €135.00",
        unit: "from",
      },
    ],
  },

  houseware: {
    title: "Houseware Services",
    description:
      "Professional cleaning for curtains, cushions, and household textiles.",
    prices: [
      {
        name: "Pillow (Houseware)",
        price: "From €11.10",
        unit: "from",
      },
      {
        name: "Single Duvet (Houseware)",
        price: "€20.25",
        unit: "per item",
      },
      {
        name: "Double Duvet (Houseware)",
        price: "€22.85",
        unit: "per item",
      },
      {
        name: "King Duvet (Houseware)",
        price: "€26.75",
        unit: "per item",
      },
      {
        name: "Feather Single Duvet (Houseware)",
        price: "€27.45",
        unit: "per item",
      },
      {
        name: "Feather Double Duvet (Houseware)",
        price: "€30.00",
        unit: "per item",
      },
      {
        name: "Feather King Duvet (Houseware)",
        price: "€32.65",
        unit: "per item",
      },
      {
        name: "Bedspread (Houseware)",
        price: "€19.60",
        unit: "per item",
      },
      {
        name: "Throw Over (Houseware)",
        price: "€22.40",
        unit: "per item",
      },
      {
        name: "Blanket Single (Houseware)",
        price: "€19.60",
        unit: "per item",
      },
      {
        name: "Blanket Double (Houseware)",
        price: "€22.85",
        unit: "per item",
      },
      {
        name: "Mat Small (Houseware)",
        price: "€22.85",
        unit: "per item",
      },
      {
        name: "Mat Medium (Houseware)",
        price: "€30.00",
        unit: "per item",
      },
      {
        name: "Sleeping Bag (Houseware)",
        price: "€20.90",
        unit: "per item",
      },
    ],
  },

  // ========================================
  // BEDLINEN SERVICES
  // ========================================
  bedlinen: {
    title: "Bedlinen Services",
    description: "Professional cleaning for duvets, pillows, and bed linens.",
    prices: [
      {
        name: "Pillow Case (Iron Only)",
        price: "€1.65",
        unit: "per item",
      },
      {
        name: "Single Flat Sheet (Iron Only)",
        price: "€4.20",
        unit: "per item",
      },
      {
        name: "Single Fitted Sheet (Iron Only)",
        price: "€4.95",
        unit: "per item",
      },
      {
        name: "Single Duvet Cover (Iron Only)",
        price: "€5.90",
        unit: "per item",
      },
      {
        name: "Double Flat Sheet (Iron Only)",
        price: "€4.95",
        unit: "per item",
      },
      {
        name: "Double Fitted Sheet (Iron Only)",
        price: "€5.90",
        unit: "per item",
      },
      {
        name: "Double Duvet Cover (Iron Only)",
        price: "€7.45",
        unit: "per item",
      },
      {
        name: "King Flat Sheet (Iron Only)",
        price: "€6.55",
        unit: "per item",
      },
      {
        name: "King Fitted Sheet (Iron Only)",
        price: "€7.45",
        unit: "per item",
      },
      {
        name: "King Duvet Cover (Iron Only)",
        price: "€8.20",
        unit: "per item",
      },
      {
        name: "Wash (For Iron Items)",
        price: "€10.00",
        unit: "per item",
      },
    ],
  },
};

const priceButtons = document.querySelectorAll(".price-btns");

const selectedPrices = document.getElementById("selectedPrices");

const selectedServiceTitle =
  document.getElementById("selectedServiceTitle");

const selectedServiceDescription =
  document.getElementById("selectedServiceDescription");

const selectedPricesGrid =
  document.getElementById("selectedPricesGrid");


// ========================================
// SHOW ONE SERVICE
// ========================================

function showServicePrices(serviceKey) {
  const selectedService = servicePrices[serviceKey];

  // Stop if the service does not exist
  if (!selectedService) {
    return;
  }

  // Change heading
  selectedServiceTitle.textContent =
    selectedService.title;

  // Change description
  selectedServiceDescription.textContent =
    selectedService.description;

  // Remove previous results
  selectedPricesGrid.innerHTML = "";

  // Create the price cards
  selectedService.prices.forEach(function (item) {
    const priceCard =
      document.createElement("div");

    priceCard.className =
      "selected-price-card";

    priceCard.innerHTML = `
      <div class="selected-price-info">

        <h3>
          ${item.name}
        </h3>

        <span>
          ${item.unit}
        </span>

      </div>

      <div class="selected-price">
        ${item.price}
      </div>
    `;

    selectedPricesGrid.appendChild(
      priceCard
    );
  });

  // Show pricing section
  selectedPrices.classList.add("show");

  // Scroll to results
  selectedPrices.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
}


// ========================================
// SERVICE CARD VIEW PRICE BUTTONS
// ========================================

priceButtons.forEach(function (button) {

  button.addEventListener(
    "click",
    function (event) {

      // Prevent href="#" from jumping
      event.preventDefault();

      // Example:
      // service-wash
      // ironing
      // dry-cleaning
      const serviceKey =
        button.dataset.service;

      showServicePrices(serviceKey);
    }
  );

});



// ========================================
// VIEW ALL PRICES
// ========================================

const viewAllPrices = document.getElementById("viewAllPrices");

viewAllPrices.addEventListener("click", function (event) {
  event.preventDefault();

  // Change the heading
  selectedServiceTitle.textContent = "All Services";

  // Change the description
  selectedServiceDescription.textContent =
    "View all available laundry services and their prices.";

  // Clear the current prices
  selectedPricesGrid.innerHTML = "";

  // Loop through every service
  Object.values(servicePrices).forEach(function (service) {
    // Add a service heading
    const serviceHeading = document.createElement("div");
    serviceHeading.className = "all-service-heading";

    serviceHeading.innerHTML = `
      <h3>${service.title}</h3>
      <p>${service.description}</p>
    `;

    selectedPricesGrid.appendChild(serviceHeading);

    // Add each price
    service.prices.forEach(function (item) {
      const priceCard = document.createElement("div");
      priceCard.className = "selected-price-card";

      priceCard.innerHTML = `
        <div class="selected-price-info">
          <h3>${item.name}</h3>
          <span>${item.unit}</span>
        </div>

        <div class="selected-price">
          ${item.price}
        </div>
      `;

      selectedPricesGrid.appendChild(priceCard);
    });
  });

  // Show the pricing section
  selectedPrices.classList.add("show");

  // Scroll to the prices
  selectedPrices.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
});

// ========================================
// SEARCH + FILTERS + QUICK OPTIONS
// ========================================

const pricingSearch = document.getElementById("pricingSearch");
const filterButtons = document.querySelectorAll(".filter-btn");
const quickButtons = document.querySelectorAll(".quick-btn");

// Keep track of what the user selected
let currentCategory = "all";
let currentQuickOption = "all";

// ========================================
// DISPLAY SEARCH RESULTS
// ========================================

function displayPricingResults() {
  // Get what the user typed
  const searchText = pricingSearch.value.toLowerCase().trim();

  // Clear old results
  selectedPricesGrid.innerHTML = "";

  let foundResults = 0;

  // Go through every service
  Object.entries(servicePrices).forEach(function ([serviceKey, service]) {
    // Check service filter
    if (currentCategory !== "all" && currentCategory !== serviceKey) {
      return;
    }

    // Find matching prices
    const matchingPrices = service.prices.filter(function (item) {
      // Search through the item name
      const matchesSearch = item.name.toLowerCase().includes(searchText);

      // Convert price to a number
      const numericPrice = parseFloat(item.price.replace(/[^0-9.]/g, ""));

      // Quick option
      let matchesQuick = true;

      if (currentQuickOption === "under10") {
        matchesQuick = numericPrice < 10;
      }

      if (currentQuickOption === "popular") {
        matchesQuick = item.popular === true;
      }

      return matchesSearch && matchesQuick;
    });

    // If nothing matched, don't show this service
    if (matchingPrices.length === 0) {
      return;
    }

    // Add service heading
    const serviceHeading = document.createElement("div");

    serviceHeading.className = "all-service-heading";

    serviceHeading.innerHTML = `
      <h3>${service.title}</h3>
      <p>${service.description}</p>
    `;

    selectedPricesGrid.appendChild(serviceHeading);

    // Create price cards
    matchingPrices.forEach(function (item) {
      const priceCard = document.createElement("div");

      priceCard.className = "selected-price-card";

      priceCard.innerHTML = `
        <div class="selected-price-info">
          <h3>${item.name}</h3>
          <span>${item.unit}</span>
        </div>

        <div class="selected-price">
          ${item.price}
        </div>
      `;

      selectedPricesGrid.appendChild(priceCard);

      foundResults++;
    });
  });

  // No results
  if (foundResults === 0) {
    selectedPricesGrid.innerHTML = `
      <div class="no-results">
        <h3>No services found</h3>
        <p>
          Try searching for something else or choose another service.
        </p>
      </div>
    `;
  }

  // Update heading
  if (currentCategory === "all") {
    selectedServiceTitle.textContent = "All Services";
  } else {
    selectedServiceTitle.textContent = servicePrices[currentCategory].title;
  }

  selectedServiceDescription.textContent = `${foundResults} service${foundResults === 1 ? "" : "s"} found`;

  // Show pricing section
  selectedPrices.classList.add("show");
}

// ========================================
// SEARCH INPUT
// ========================================

pricingSearch.addEventListener("input", function () {
  displayPricingResults();
});

// ========================================
// SERVICE FILTERS
// ========================================

filterButtons.forEach(function (button) {
  button.addEventListener("click", function () {
    // Remove active from all buttons
    filterButtons.forEach(function (btn) {
      btn.classList.remove("active");
    });

    // Make clicked button active
    button.classList.add("active");

    // Get selected category
    currentCategory = button.dataset.category;

    // Display results
    displayPricingResults();
  });
});

// ========================================
// QUICK OPTIONS
// ========================================

quickButtons.forEach(function (button) {
  button.addEventListener("click", function () {
    // Remove active from all quick buttons
    quickButtons.forEach(function (btn) {
      btn.classList.remove("active");
    });

    // Make clicked button active
    button.classList.add("active");

    // Get quick option
    currentQuickOption = button.dataset.quick;

    // Display results
    displayPricingResults();
  });
});
