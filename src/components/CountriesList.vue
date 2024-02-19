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

<script setup>
import { useCountries } from "../composables/CountriesList";

const {
  filter,
  isLoading,
  error,
  groupedCountries,
  toggleSelection,
  getBackgroundColor,
  applyFilter,
} = useCountries();
</script>
