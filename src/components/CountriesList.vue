<template>
  <div class="container">
    <div>
      <input
        v-model="filter"
        placeholder="search:tt group:continent/language/currency"
        @input="applyFilter"
      />
      <div v-if="isLoading">Loading...</div>
      <div v-if="error">{{ error }}</div>
      <div v-else>
        <div v-for="(group, groupName) in groupedCountries" :key="groupName">
          <h3>{{ groupName }}</h3>
          <ul>
            <li
              v-for="country in group"
              :key="country.code"
              @click="toggleSelection(country)"
              :style="{ backgroundColor: getBackgroundColor(country) }"
            >
              {{ country.name }}
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { fetchCountries } from "../graphql-queries";

export default {
  data() {
    return {
      countries: [],
      filter: "",
      selectedCountry: null,
      isLoading: false,
      error: null,
      backgroundColors: ["#52D3D8", "#9CFF2E", "#FDFF00", "#D24545"],
      lastSelectedIndex: 0,
      groupedCountries: {},
      isGrouped: false,
    };
  },
  methods: {
    async fetchAndProcessCountries() {
      this.isLoading = true;
      try {
        const countries = await fetchCountries();
        this.countries = countries;
        this.isLoading = false;
        this.applyFilter();
      } catch (error) {
        console.error("Failed to fetch countries", error);
        this.error = "Failed to fetch countries";
        this.isLoading = false;
      }
    },
    applyFilter() {
      let tempCountries = [...this.countries];
      this.groupedCountries = {};
      this.isGrouped = false;

      const parts = this.filter.split(" ").filter(Boolean);
      let searchQuery = "";
      let groupBy = "";

      parts.forEach((part) => {
        if (part.startsWith("search:")) {
          searchQuery = part.substring("search:".length);
        } else if (part.startsWith("group:")) {
          groupBy = part.substring("group:".length);
        }
      });

      if (searchQuery) {
        tempCountries = tempCountries.filter((country) =>
          country.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }

      if (groupBy) {
        this.isGrouped = true;
        // Group by languages or currency
        if (groupBy === "languages") {
          tempCountries.forEach((country) => {
            country.languages.forEach((language) => {
              const groupName = language.name;
              if (!this.groupedCountries[groupName]) {
                this.groupedCountries[groupName] = [];
              }
              this.groupedCountries[groupName].push(country);
            });
          });
        } else if (groupBy === "currency") {
          tempCountries.forEach((country) => {
            const groupName = country.currency || "Unknown";
            if (!this.groupedCountries[groupName]) {
              this.groupedCountries[groupName] = [];
            }
            this.groupedCountries[groupName].push(country);
          });
        } else {
          // Fallback to continent grouping or others
          tempCountries.forEach((country) => {
            const groupName = country[groupBy]?.name || "Others";
            if (!this.groupedCountries[groupName]) {
              this.groupedCountries[groupName] = [];
            }
            this.groupedCountries[groupName].push(country);
          });
        }
      } else {
        this.groupedCountries["All"] = tempCountries;
      }

      this.autoSelectItem();
    },
    toggleSelection(country) {
      if (this.selectedCountry && this.selectedCountry.code === country.code) {
        this.selectedCountry = null;
      } else {
        this.selectedCountry = country;
        // Change color for the next selection
        this.lastSelectedIndex =
          (this.lastSelectedIndex + 1) % this.backgroundColors.length;
      }
    },
    getBackgroundColor(country) {
      if (this.selectedCountry && this.selectedCountry.code === country.code) {
        return this.backgroundColors[this.lastSelectedIndex];
      }
      return ""; // Default background color for unselected items
    },
    autoSelectItem() {
      const allCountries = Object.values(this.groupedCountries).flat();
      if (allCountries.length) {
        const index = Math.min(9, allCountries.length - 1); // 10th item or last if fewer than 10
        this.selectedCountry = allCountries[index];
        this.lastSelectedIndex = index % this.backgroundColors.length; // Ensure color changes for auto-selected item
      }
    },
  },
  watch: {
    filter() {
      this.applyFilter();
    },
  },
  mounted() {
    this.fetchAndProcessCountries();
  },
};
</script>
