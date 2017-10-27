class  ArticleData {
    title: string;
    description: string;
    image: string;
    imageRatio: number;

    constructor(title: string,
        description: string,
        image: string,
        imageRatio: number) {

        this.title = title;
        this.description = description;
        this.image = image;
        this.imageRatio = imageRatio;
    }
}
