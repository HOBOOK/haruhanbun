<template>
  <div ref="container" class="heatmap-container">
    <canvas ref="heatmap"></canvas>
  </div>
</template>


<script>
export default {
  name: 'Heatmap',
  props: {
    data: { type: Array, required: true },
  },
  watch: {
    data() {
      this.resizeCanvas()
    }
  },
  mounted() {
    // 첫 렌더링
    this.resizeCanvas()
    // 윈도우 크기 변경 시 리사이즈
    window.addEventListener("resize", this.resizeCanvas)
  },
  beforeDestroy() {
    window.removeEventListener("resize", this.resizeCanvas)
  },
  methods: {
    resizeCanvas() {
      const container = this.$refs.container
      const canvas = this.$refs.heatmap
      const ctx = canvas.getContext("2d")

      const width = container.clientWidth
      const height = container.clientHeight || 120

      const dpr = window.devicePixelRatio || 1
      canvas.width = width * dpr
      canvas.height = height * dpr
      canvas.style.width = width + "px"
      canvas.style.height = height + "px"
      ctx.scale(dpr, dpr)

      // ✅ 1년 기준으로 주/요일 계산
      const weeksInYear = 53 // 최대 53주
      const daysInWeek = 7

      // cellSize, gap 자동 계산
      const gapRatio = 0.2 // 셀 크기 대비 간격 비율 (20%)
      const dynamicCellSize = width / (weeksInYear + (weeksInYear * gapRatio))
      const dynamicGap = dynamicCellSize * gapRatio

      this.drawHeatmap(ctx, width, height, dynamicCellSize, dynamicGap)
    },

    drawHeatmap(ctx, width, height, cellSize, gap) {
      ctx.clearRect(0, 0, width, height)

      const year = new Date().getFullYear()
      const jan1 = new Date(year, 0, 1)

      // 👉 1월 1일이 포함된 주의 "월요일"을 startDate로 맞추기
      const day = jan1.getDay()         // 0=일,1=월,...6=토
      const diff = (day + 6) % 7        // 월요일 기준 보정
      const startDate = new Date(jan1)
      startDate.setDate(jan1.getDate() - diff)

      const colors = ["#ebedf0", "#c6e48b", "#7bc96f", "#239a3b", "#196127"]

      // 1. 올해 마지막 주 번호 구하기
      const maxWeek = Math.max(
        ...this.data.map(({ date }) => {
          const d = new Date(date)
          return Math.floor((d - startDate) / (7 * 24 * 60 * 60 * 1000))
        })
      )

      // 2. 총 너비 & 가운데 offset 계산
      const totalWidth = (maxWeek + 1) * (cellSize + gap)
      const offsetX = (width - totalWidth) / 2

      // 3. 데이터 루프
      this.data.forEach(({ date, value }) => {
        const d = new Date(date)

        // 👉 월요일=0 ~ 일요일=6
        const dayOfWeek = (d.getDay() + 6) % 7
        const week = Math.floor((d - startDate) / (7 * 24 * 60 * 60 * 1000))

        let idx = 0
        if (value > 0 && value < 3) idx = 1
        else if (value < 5) idx = 2
        else if (value < 10) idx = 3
        else if (value >= 10) idx = 4

        const x = offsetX + week * (cellSize + gap)
        const y = dayOfWeek * (cellSize + gap)

        ctx.fillStyle = colors[idx]
        ctx.fillRect(x, y, cellSize, cellSize)
      })
    }



  }
}

</script>

<style scoped>
.heatmap-container {
  width: 100%;
  height: auto;
  /* 부모 높이 지정 (flex/grid라면 auto도 가능) */
  overflow-x: auto;
}
</style>
