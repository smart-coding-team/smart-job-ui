<template>
  <div>
    <svg-icon icon-class="question" @click="goto"/>
  </div>
</template>

<script>
export default {
  name: 'ProjectCodeDoc',
  data() {
    return {
      url: 'https://github.com/smart-coding-team/smart-job'
    }
  },
  methods: {
    goto() {
      window.open(this.url)
    }
  }
}
</script>
