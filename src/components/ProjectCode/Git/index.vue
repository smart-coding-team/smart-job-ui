<template>
  <div>
    <svg-icon icon-class="github" @click="goto"/>
  </div>
</template>

<script>
export default {
  name: 'smartJobGit',
  data() {
    return {
      url: 'https://github.com/smart-coding-team/smart-job.git'
    }
  },
  methods: {
    goto() {
      window.open(this.url)
    }
  }
}
</script>