class UserView {
    constructor(user) {
        let { id, avatar, email, location, name, username, time } = { ...user }
        this.id = id
        this.avatar = avatar
        this.email = email
        this.location = location
        this.name = name
        this.username = username
        this.time = time
        //Object.assign(this, user)
    }
    render() {

        const html =
            `<div class = "user">
<img src = "${this.avatar}" />
<div class = "info">
<h3>${this.username}</h3>
<small>${(new Date(this.time)).toDateString()}</small>
</div>
</div>`
        var wrapper = document.createElement('div');
        wrapper.innerHTML = html;
        this.el = wrapper.firstChild;
        return this.el
    }
    update(time) {
    }
}