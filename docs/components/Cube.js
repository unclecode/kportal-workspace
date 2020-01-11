class CubeView {
    constructor(name, cube) {
        this.name = name
        this.time = cube.time
        this.complete = cube.complete
        this.current = cube.current
        this.result = cube.result
        this.url = cube.url

        this.topic = this.current.lesson.split('/')[0].split('.')[1]
        this.lesson = this.current.lesson.split('/')[1].split('.')[1]

        this.progress = this.getProgress()

        this.scenarioTags = this.current.scenario.split('#').map(s=>`#${s}`)
    }
    getProgress() {
        let passed = 0;
        let failed = 0;
        let pending = 0;
        for (let [key, value] of Object.entries(this.result)) {
            passed += value.test === "passed" ? 1 : 0
            failed += value.test === "failed" ? 1 : 0
            pending += value.test === "pending" ? 1 : 0
        }
        return {
            passed, pending, failed, total: Object.keys(this.result).length
        }
    }
    render(el) {
        this.el = el;
        let performed = (this.progress.passed / this.progress.total)*100
        const html =
`<div class = "cube">
<div class = "progress" style="background: linear-gradient(to bottom, #eee ${performed}%, #33CC57 ${performed}%);">${performed}%</div>
<div class = "caption">
<h4>${this.name}</h4>
<h5><a href = "#">${this.topic}/${this.lesson}</a></h5>
<div class = "info">
    <span class = "text-success">${this.progress.passed} ✔</span>, 
    <span class = "text-info">${this.progress.pending} ⟲</span>,
    <span class = "text-danger">${this.progress.failed} ✖</span>,
    <span class = "">${this.scenarioTags.join(' ')}</span>
</div>
</div>                
</div>`
        var wrapper = document.createElement('div');
        wrapper.innerHTML = html;
        this.el = wrapper.firstChild;
        return this.el
    }
}