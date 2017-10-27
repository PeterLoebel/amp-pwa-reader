//import { ShadowReader, IssueEntry } from "./classes";

class  IssueReader {

    shadowReader: ShadowReader;

    constructor(shadowReader: ShadowReader) {
        this.shadowReader = shadowReader;
    }

    fetch(category) {

       // let allIssuesUrl: string = '/Issues/AllByCategoryJson/' + category;
        let allIssuesUrl: string = '/Issues/AllJson/';

        return fetch(allIssuesUrl)
            .then(response => response.json())
            .then(issuesList => {

                let entries = issuesList;

                return entries.map(entry => {
                    return new IssueEntry(
                        this.shadowReader.backend.getIssueTitle(entry),
                        this.shadowReader.backend.getIssueIssue(entry),
                        this.shadowReader.backend.getIssueLink(entry),
                        this.shadowReader.backend.getIssueImage(entry) )
                });
            });
    }
}
