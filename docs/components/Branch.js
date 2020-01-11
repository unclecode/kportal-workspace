class Branch {
    constructor(key, testResult) {
        this.key = key
        let { status, total, passed, failed } = { ...testResult.test }
        this.test = {
            status,
            total,
            passed,
            failed
        }


    }
    render() {
        const html =
`<div class = "branch">
    <span>${this.test.status === "passed" ? '✅' : '🔄'}</span>
    <a href = "#">${this.key}</a>
    <span class = "text-success">${this.test.passed} ✔</span>
    <span class = "text-danger">${this.test.failed} ✖</span>
    <a href = "#" style = "margin-left:1rem">details</a>
</div>`
        var wrapper = document.createElement('div');
        wrapper.innerHTML = html;
        this.el = wrapper.firstChild;
        return this.el;

    }
}