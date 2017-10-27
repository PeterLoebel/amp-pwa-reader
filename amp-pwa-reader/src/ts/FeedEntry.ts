class FeedEntry {
    title: string;
    description: string;
    link: string;
    image: string;
    content: Array<string>;

    constructor(title: string,
        description: string,
        link: string,
        image: string,
        content: Array<string>) {

        this.title = title;
        this.description = description;
        this.link = link;
        this.image = image;
        this.content = content;
    }
}
