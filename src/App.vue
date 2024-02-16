<template>
  <div id="app">
    <CountriesList />
  </div>
</template>

<script>
import CountriesList from "./components/CountriesList.vue";

export default {
  name: "App",
  components: {
    CountriesList,
  },
};
</script>
