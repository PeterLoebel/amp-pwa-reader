class  IssueEntry {
    title: string;
    description: string;
    link: string;
    image: string;

    constructor(title: string,
        description: string,
        link: string,
        image: string) {

        this.title = title;
        this.description = description;
        this.link = link;
        this.image = image;
    }
}
