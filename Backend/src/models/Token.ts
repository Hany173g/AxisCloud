import {Schema,model,Document} from "mongoose"








interface IToken {
    token : string,
    userId:string
}








let tokenSchema = new Schema<IToken> ({
    token : {type:String,required:true,unique:true},
    userId : {type:String,required:true}
},
{
    timestamps:true
})






export const Token  = model<IToken>("Tokens",tokenSchema)


export interface ITokenDocument extends IToken, Document {}











