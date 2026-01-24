import {Query} from "mongoose"












export class ApiFeatures<T>  {
    query : Query<T[],T>
    queryString : Record<string, any>
    constructor(query : Query<T[],T>,queryString : Record<string,any>)
    {
        this.query = query
        this.queryString = queryString
    }
    filter() {
    const queryObj = { ...this.queryString };
    const excludeFields = ["page", "sort", "limit", "fields"]; 
    excludeFields.forEach((el) => delete queryObj[el]);
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    this.query = this.query.find(JSON.parse(queryStr));
    return this; 
    }
    sort() {
       const {sort} = this.queryString 
       if (typeof sort == "string")
       {
        let sortArr = sort.split(",")
        let sortQuery = sortArr.join(" ")
        this.query = this.query.sort(sortQuery)
       } 
        return this 
    }
    loadNextChunk() {
        const {skip} = this.queryString
        if (skip !== undefined) {
            const skipNum = typeof skip === "string" ? Number.parseInt(skip, 10) : Number(skip)
            const safeSkip = Number.isFinite(skipNum) && skipNum >= 0 ? skipNum : 0
            let limit = 10
            this.query = this.query.skip(safeSkip).limit(limit)
        }
        return this
    }
    limitsFields() {
       const {fields} = this.queryString 
       if (typeof fields == "string")
       {
        let fieldsArr = fields.split(",")
        let fieldsQuery = fieldsArr.join(" ")
        this.query = this.query.select(fieldsQuery)
       } 
        return this 
    }
}