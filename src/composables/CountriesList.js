import { ref, onMounted } from "vue";
import { fetchCountries } from "../graphql-queries";

export function useCountries() {
  const countries = ref([]);
  const filter = ref("");
  const selectedCountry = ref(null);
  const isLoading = ref(false);
  const error = ref(null);
  const groupedCountries = ref({});
  const isGrouped = ref(false);
  const backgroundColors = ["#52D3D8", "#9CFF2E", "#FDFF00", "#D24545"];
  let lastSelectedIndex = 0;

  async function fetchAndProcessCountries() {
    isLoading.value = true;
    try {
      const response = await fetchCountries();
      countries.value = response;
      isLoading.value = false;
      applyFilter();
    } catch (err) {
      console.error("Failed to fetch countries", err);
      error.value = "Failed to fetch countries";
      isLoading.value = false;
    }
  }

  function applyFilter() {
    let tempCountries = [...countries.value];
    groupedCountries.value = {};
    isGrouped.value = false;

    const parts = filter.value.split(" ").filter(Boolean);
    let searchQuery = "";
    let groupBy = "";

    parts.forEach((part) => {
      if (part.startsWith("search:")) {
        searchQuery = part.substring("search:".length).toLowerCase();
      } else if (part.startsWith("group:")) {
        groupBy = part.substring("group:".length).toLowerCase();
      }
    });

    if (searchQuery) {
      tempCountries = tempCountries.filter((country) =>
        country.name.toLowerCase().includes(searchQuery)
      );
    }

    if (groupBy) {
      isGrouped.value = true;
      const validGroupByCriteria = ["languages", "currency", "continent"]; // Add or remove criteria as needed
      const isGroupByValid = validGroupByCriteria.includes(groupBy);

      tempCountries.forEach((country) => {
        let groupName = "Others"; // Default group name for invalid or in-progress typing

        if (isGroupByValid) {
          if (groupBy === "languages" && country.languages) {
            country.languages.forEach((language) => {
              groupName = language.name;
              if (!groupedCountries.value[groupName]) {
                groupedCountries.value[groupName] = [];
              }
              groupedCountries.value[groupName].push(country);
            });
            return; // Prevent adding the country to "Others"
          } else if (groupBy === "currency" && country.currency) {
            groupName =
              typeof country.currency === "string"
                ? country.currency
                : country.currency?.name || "Unknown";
          } else if (country[groupBy]) {
            groupName = country[groupBy].name || "Others";
          }
        }

        if (!groupedCountries.value[groupName]) {
          groupedCountries.value[groupName] = [];
        }
        if (isGroupByValid || groupName === "Others") {
          // Add to "Others" if criteria is invalid or in progress
          groupedCountries.value[groupName].push(country);
        }
      });
    } else {
      groupedCountries.value["All"] = tempCountries;
    }

    autoSelectItem();
  }

  function toggleSelection(country) {
    if (selectedCountry.value && selectedCountry.value.code === country.code) {
      selectedCountry.value = null;
    } else {
      selectedCountry.value = country;
      lastSelectedIndex = (lastSelectedIndex + 1) % backgroundColors.length;
    }
  }

  function getBackgroundColor(country) {
    if (selectedCountry.value && selectedCountry.value.code === country.code) {
      return backgroundColors[lastSelectedIndex];
    }
    return ""; // Default background color for unselected items
  }

  function autoSelectItem() {
    const allCountries = Object.values(groupedCountries.value).flat();
    if (allCountries.length) {
      const index = Math.min(9, allCountries.length - 1);
      selectedCountry.value = allCountries[index];
      lastSelectedIndex = index % backgroundColors.length;
    }
  }

  onMounted(() => {
    fetchAndProcessCountries();
  });

  return {
    countries,
    filter,
    selectedCountry,
    isLoading,
    error,
    groupedCountries,
    isGrouped,
    toggleSelection,
    getBackgroundColor,
    applyFilter,
  };
}
