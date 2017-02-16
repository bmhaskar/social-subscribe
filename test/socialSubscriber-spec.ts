const Promise: any = require("bluebird");
import * as chai from "chai";
const R = require("ramda");
const Task = require("data.task");
const localtunnel = require('localtunnel');

import {repository} from "./utils/repository";
import {createServer as createServerCurry} from "./utils/server";
import {
    lookUpLongLivedAccessToken as lookUpLongLivedAccessTokenCurry,
} from "../src/services/accessTokenService";
import {SocialSubscribe} from "../src/index";
import {
    getUserPageDetails as getUserPageDetailsCurry,
    doFbPostOnPage as doFbPostOnPageCurry,
} from "../src/services/subscribeService";

const localServerPort = 3050;
const createServer = createServerCurry(localServerPort);
const expect = chai.expect;

describe("Test subscribe service", function () {
    this.timeout(50000);
    let server: any;
    let tunnel: any;
    const shortLivedAccessToken = "EAADvbGAQt94BAE0utnCYbUBgmMlqB70CTVDwp79JdLZBFSt2SzyZCPVjuPtmehGROxgY2yDig6" +
        "6QLEZCnFY31fRp2ZAZAOPWnO9pVlTbOf8C8yuztJYeZB2EOgmZCmU3whe2w9I5c5G386ftaOwqYZBGWAeybD0kJ1iI5ZBd8ZAzucwzv" +
        "LjarmYwGg5sxwmU2eLwgZD";
    const config = {
        appId: "263248747214814",
        appSecret: "4454810a488876bc8b716e76f8be8de2",
        callBackURL: "http://localhost:3050",
        graphApiHost: "https://graph.facebook.com",
        repository,
        shortLivedAccessToken,
    };

    before((done) => {
        server = createServer((err: Error) => {
            if (err) {
                done(err);
            }
            tunnel = localtunnel(localServerPort, (error: Error, newTunnel: any) => {
                if (error) {
                    done(error);
                }
                config.callBackURL = newTunnel.url;
                done();
            });

        });

    });

    after((done) => {
        tunnel.on("close", () => {
            server.close(() => done());
        });
        tunnel.close();
    });

    it("should subscribe to the facebook pages", (done) => {
        const socialSubscribe = new SocialSubscribe(config);
        socialSubscribe.on("success", (obj: any) => {
            expect(obj).to.be.not.empty;
            expect(obj).to.haveOwnProperty("success");
            expect(obj.success).to.to.be.true;


            // const getPageDetails = getUserPageDetailsCurry(config);
            // const doFbPostOnPage = doFbPostOnPageCurry(config)("This is a test post");
            // const lookUpLongLivedAccessToken = lookUpLongLivedAccessTokenCurry(Task)(config);
            //
            //
            // const pageIds: any = R.compose(
            //     // R.map((pages: any) => {console.log(pages); return pages; }),
            //     R.map(R.prop("data")),
            //     R.chain(getPageDetails),
            //     lookUpLongLivedAccessToken,
            //     );
            //
            //
            //
            // const doFbPostOnPages = R.compose(
            //
            //     //  R.chain(R.map(pageIds)),
            //     // R.map((...args: any[]) => console.log(args)),
            //     R.map((args: any[]) => {console.log(args); return args; }),
            //     R.unnest,
            //     // R.map(R.sequence(Task.of)),
            //     R.map(R.map(R.map(pageIds))),
            //     lookUpLongLivedAccessToken);
            //
            //
            //
            // // pages_show_list
            // // manage pages
            // // publish_actions
            //
            // // const temp: any = doFbPostOnPages();
            // doFbPostOnPages().fork(done, (pageIds: any) => {
            //     expect(pageIds).to.be.not.empty;
            //     expect(pageIds).to.be.instanceof(Array);
            //
            //     done();
            // });

        });

        socialSubscribe.on("error", done);

        server.on("request", socialSubscribe.apiCallback);

        socialSubscribe.start();

    });
});