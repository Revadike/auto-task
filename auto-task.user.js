// ==UserScript==
// @name         自动任务
// @namespace    auto-task
// @version      2.0.6
// @description  自动完成赠key站任务
// @author       HCLonely
// @license      MIT
// @iconURL      https://hclonely.github.io/auto-task/favicon.ico
// @homepage     https://hclonely.github.io/auto-task/
// @supportURL   https://github.com/HCLonely/auto-task/issues
// @updateURL    https://hclonely.github.io/auto-task/auto-task.user.js
// @include      *://giveaway.su/giveaway/view/*
// @include      *://marvelousga.com/*
// @include      *://dupedornot.com/*
// @include      *://www.grabfreegame.com/giveaway/*
// @include      *://www.bananagiveaway.com/giveaway/*
// @include      *://gamecode.win/*
// @include      /https?:\/\/gamehag.com/.*?giveaway\/.*/
// @include      *://prys.revadike.com/giveaway/?id=*
// @include      *://www.indiedb.com/giveaways*
// @include      *://www.opiumpulses.com/giveaways
// @include      *://gkey.fun/distribution/*
// @include      *://givekey.ru/distribution/*
// @include      *://chubkeys.com/giveaway/*
// @include      *://giveawayhopper.com/giveaway/*
// @include      *://*freegamelottery.com*
// @include      *://gleam.io/*
// @include      *://www.spoune.com/index.php*
// @exclude      *googleads*
// @include      https://hclonely.github.io/auto-task/setting.html
// @include      https://hclonely.github.io/auto-task/announcement.html
// @require      https://cdn.bootcss.com/vue/2.6.10/vue.min.js
// @require      https://cdn.bootcss.com/element-ui/2.12.0/index.js
// @require      https://cdn.bootcss.com/jquery/3.4.1/jquery.min.js
// @resource     css https://hclonely.github.io/auto-task/auto-task.min.css?ver=2.0.6
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_listValues
// @grant        GM_deleteValue
// @grant        GM_addStyle
// @grant        GM_xmlhttpRequest
// @grant        GM_getResourceText
// @grant        GM_registerMenuCommand
// @grant        GM_info
// @grant        GM_openInTab
// @grant        GM_download
// @connect      *
// @run-at       document-end
// @compatible   chrome >=58 没有测试其他浏览器的兼容性
// ==/UserScript==

(function() {
    'use strict';

    GM_addStyle(GM_getResourceText('css'));
    $('body').append('<div v-cloak id="vue-ui"></div>');
    let vueUi = new Vue({
        el: "#vue-ui"
    });
    Vue.config.errorHandler = function(err, vm, info) {
        setTimeout(() => {
            vueUi.$message({
                type: "error",
                duration: 0,
                message: "脚本执行出错，详细信息请查看控制台(红色背景部分)！",
                showClose: true
            });
        }, 500);
        console.log("%c%s", "color:white;background:red", "Info:" + info + "\nError:" + err.stack);
    }
    $(document).ajaxError(function(event, xhr, options, exc) {
        vueUi.$message({
            type: "error",
            duration: 0,
            message: "脚本执行出错，详细信息请查看控制台(红色背景部分)！",
            showClose: true
        });
        console.log("%c%s", "color:white;background:red", "Ajax请求出错：");
        console.log("Event:", event);
        console.log("XMLHttpRequest :", xhr);
        console.log("Options:", options);
        console.log("JavaScript exception:", exc);
    });

    try {

        const steamInfo = GM_getValue('steamInfo') || {
            userName: '',
            steam64Id: '',
            communitySessionID: '',
            storeSessionID: '',
            updateTime: 0
        };
        const defaultConf = {
            fuck: {
                group: 1,
                curator: 1,
                developer: 1,
                publisher: 1,
                announcement: 1,
                wishlist: 1,
                followGame: 1,
                visit: 1,
                verify: 1
            },
            verify: {
                verify: 1
            },
            join: {
                group: 1,
                curator: 1,
                developer: 1,
                publisher: 1,
                announcement: 1,
                wishlist: 1,
                followGame: 1,
                visit: 1
            },
            remove: {
                group: 1,
                curator: 1,
                developer: 1,
                publisher: 1,
                wishlist: 1,
                followGame: 1
            },
            other: {
                showLogs: 1,
                showDetails: 0,
                checkLogin: 1,
                checkLeft: 1,
                autoOpen: 0
            },
            announcement: ""
        };
        let globalConf = (GM_getValue('conf') && GM_getValue('conf').global) ? GM_getValue('conf').global : defaultConf;
        let debug = !!globalConf.other.showDetails;
        const fuc = {
            httpRequest: function(e) {
                let requestObj = {};
                requestObj.url = e.url;
                requestObj.method = e.method.toUpperCase();
                requestObj.timeout = e.timeout || 30000;
                if (e.dataType) requestObj.responseType = e.dataType;
                if (e.headers) requestObj.headers = e.headers;
                if (e.data) requestObj.data = e.data;
                if (e.onload) requestObj.onload = e.onload;
                requestObj.ontimeout = e.ontimeout || function(data) {
                    if (debug) console.log(data);
                    if (e.status) e.status.error('Error:Timeout(0)');
                    if (e.r) e.r({
                        result: 'error',
                        statusText: 'Timeout',
                        status: 0,
                        option: e
                    });
                };
                requestObj.onabort = e.onabort || function(data) {
                    if (debug) console.log(data);
                    if (e.status) e.status.error('Error:Aborted(0)');
                    if (e.r) e.r({
                        result: 'error',
                        statusText: 'Aborted',
                        status: 0,
                        option: e
                    });
                };
                requestObj.onerror = e.onerror || function(data) {
                    if (debug) console.log(data);
                    if (e.status) e.status.error('Error:Error(0)');
                    if (e.r) e.r({
                        result: 'error',
                        statusText: 'Error',
                        status: 0,
                        option: e
                    });
                };
                if (debug) {
                    console.log('发送请求:');
                    console.log(requestObj);
                }
                GM_xmlhttpRequest(requestObj);
            },
            updateSteamInfo: function(r, type = "all", update = false) {
                if (new Date().getTime() - steamInfo.updateTime > 10 * 60 * 1000 || update) {
                    let pro = [];
                    if (type === "community" || type === "all") {
                        pro.push(new Promise(r => {
                            let status = this.echoLog({
                                type: 'updateSteamCommunity'
                            });
                            this.httpRequest({
                                url: 'https://steamcommunity.com/my',
                                method: "GET",
                                onload: (response) => {
                                    if (debug) console.log(response);
                                    if (response.status === 200) {
                                        let steam64Id = response.responseText.match(/g_steamID = \"(.+?)\";/);
                                        let communitySessionID = response.responseText.match(/g_sessionID = \"(.+?)\";/);
                                        let userName = response.responseText.match(/steamcommunity.com\/id\/(.+?)\/friends\//);
                                        if (steam64Id) steamInfo.steam64Id = steam64Id[1];
                                        if (communitySessionID) steamInfo.communitySessionID = communitySessionID[1];
                                        if (userName) steamInfo.userName = userName[1];
                                        status.success();
                                        r({
                                            result: 'success',
                                            statusText: response.statusText,
                                            status: response.status
                                        });
                                    } else {
                                        status.error('Error:' + response.statusText + '(' + response.status + ')');
                                        r({
                                            result: 'error',
                                            statusText: response.statusText,
                                            status: response.status
                                        });
                                    }
                                },
                                r,
                                status
                            });
                        }));
                    }
                    if (type === "store" || type === "all") {
                        pro.push(new Promise(r => {
                            let status = this.echoLog({
                                type: 'updateSteamStore'
                            });

                            this.httpRequest({
                                url: 'https://store.steampowered.com/stats/',
                                method: "GET",
                                onload: (response) => {
                                    if (debug) console.log(response);
                                    if (response.status === 200) {
                                        let storeSessionID = response.responseText.match(/g_sessionID = \"(.+?)\";/);
                                        if (storeSessionID) steamInfo.storeSessionID = storeSessionID[1];
                                        status.success();
                                        r({
                                            result: 'success',
                                            statusText: response.statusText,
                                            status: response.status
                                        });
                                    } else {
                                        status.error('Error:' + response.statusText + '(' + response.status + ')');
                                        r({
                                            result: 'error',
                                            statusText: response.statusText,
                                            status: response.status
                                        });
                                    }
                                },
                                r,
                                status
                            });
                        }));
                    }
                    Promise.all(pro).then(data => {
                        steamInfo.updateTime = new Date().getTime();
                        GM_setValue('steamInfo', steamInfo);
                        r(1);
                    });
                } else {
                    r(1);
                }
            },
            joinSteamGroup: function(r, group) {
                let status = this.echoLog({
                    type: 'joinSteamGroup',
                    text: group
                });

                this.httpRequest({
                    url: 'https://steamcommunity.com/groups/' + group,
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
                    },
                    data: $.param({
                        action: "join",
                        sessionID: steamInfo.communitySessionID
                    }),
                    onload: (response) => {
                        if (debug) console.log(response);
                        if (response.status === 200 && !response.responseText.includes('grouppage_join_area')) {
                            status.success();
                            r({
                                result: 'success',
                                statusText: response.statusText,
                                status: response.status
                            });
                        } else {
                            status.error('Error:' + response.statusText + '(' + response.status + ')');
                            r({
                                result: 'error',
                                statusText: response.statusText,
                                status: response.status
                            });
                        }
                    },
                    r,
                    status
                });
            },
            getGroupID: function(groupName, callback) {
                let status = this.echoLog({
                    type: 'getGroupId',
                    text: groupName
                });
                let groupNameToId = GM_getValue('groupNameToId') || {};
                if (groupNameToId[groupName]) {
                    status.success();
                    callback(groupName, groupNameToId[groupName]);
                } else {
                    let pro = new Promise(resolve => {
                        this.httpRequest({
                            url: "https://steamcommunity.com/groups/" + groupName,
                            method: "GET",
                            headers: {
                                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
                            },
                            onload: function(response) {
                                if (debug) console.log(response);
                                if (response.status === 200) {
                                    let groupId = response.responseText.match(/OpenGroupChat\( \'([0-9]+)\'/);
                                    if (groupId === null) {
                                        status.error('Error:' + response.statusText + '(' + response.status + ')');
                                        resolve('err');
                                    } else {
                                        status.success();
                                        groupNameToId[groupName] = groupId[1];
                                        GM_setValue('groupNameToId', groupNameToId);
                                        resolve(groupId[1]);
                                    }
                                } else {
                                    status.error('Error:' + response.statusText + '(' + response.status + ')');
                                    resolve('err');
                                }
                            },
                            status,
                            r: () => {
                                resolve('err');
                            }
                        });
                    });
                    pro.then(function(groupId) {
                        if (groupId !== 'err' && callback) {
                            callback(groupName, groupId);
                        }
                    });
                }
            },
            leaveSteamGroup: function(r, groupName) {
                this.getGroupID(groupName, (groupName, groupId) => {
                    let status = this.echoLog({
                        type: 'leaveSteamGroup',
                        text: groupName
                    });

                    this.httpRequest({
                        url: 'https://steamcommunity.com/id/' + steamInfo.userName + '/home_process',
                        method: "POST",
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
                        },
                        data: $.param({
                            sessionID: steamInfo.communitySessionID,
                            action: "leaveGroup",
                            groupId: groupId
                        }),
                        onload: (response) => {
                            if (debug) console.log(response);
                            if (response.status === 200 && response.finalUrl.includes('groups') && $(response.responseText.toLowerCase()).find(`a[href='https://steamcommunity.com/groups/${groupName.toLowerCase()}']`).length === 0) {
                                status.success();
                                r({
                                    result: 'success',
                                    statusText: response.statusText,
                                    status: response.status
                                });
                            } else {
                                status.error('Error:' + response.statusText + '(' + response.status + ')');
                                r({
                                    result: 'error',
                                    statusText: response.statusText,
                                    status: response.status
                                });
                            }
                        },
                        r,
                        status
                    });
                });
            },
            followCurator: function(r, curatorId, follow = '1', status = '') {
                status = status || this.echoLog({
                    type: follow === '1' ? 'followCurator' : 'unfollowCurator',
                    text: curatorId
                });

                this.httpRequest({
                    url: 'https://store.steampowered.com/curators/ajaxfollow',
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
                    },
                    data: $.param({
                        clanid: curatorId,
                        sessionid: steamInfo.storeSessionID,
                        follow: follow
                    }),
                    dataType: 'json',
                    onload: (response) => {
                        if (debug) console.log(response);
                        if (response.status === 200 && response.response && response.response.success && response.response.success.success === 1) {
                            status.success();
                            r({
                                result: 'success',
                                statusText: response.statusText,
                                status: response.status
                            });
                        } else {
                            status.error(`Error:${response.response.msg||response.statusText}(${response.response.success||response.status})`);
                            r({
                                result: 'error',
                                statusText: response.statusText,
                                status: response.status
                            });
                        }
                    },
                    r,
                    status
                });
            },
            unfollowCurator: function(r, curatorId) {
                this.followCurator(r, curatorId, '0');
            },
            getCuratorID: function(developerName, callback, isPublisher = 0) {
                let status = this.echoLog({
                    type: isPublisher ? 'getPublisherId' : 'getDeveloperId',
                    text: developerName
                });
                let developerNameToId = GM_getValue('developerNameToId') || {};
                if (developerNameToId[developerName]) {
                    status.success();
                    callback(developerName, developerNameToId[developerName]);
                } else {
                    let pro = new Promise(resolve => {
                        this.httpRequest({
                            url: `https://store.steampowered.com/${isPublisher?"publisher":"developer"}/${developerName}`,
                            method: "GET",
                            headers: {
                                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
                            },
                            onload: function(response) {
                                if (debug) console.log(response);
                                if (response.status === 200) {
                                    let developerId = response.responseText.match(/g_pagingData.*?"clanid":([\d]+)/);
                                    if (developerId === null) {
                                        status.error('Error:' + response.statusText + '(' + response.status + ')');
                                        resolve('err');
                                    } else {
                                        status.success();
                                        developerNameToId[developerName] = developerId[1];
                                        GM_setValue('developerNameToId', developerNameToId);
                                        resolve(developerId[1]);
                                    }
                                } else {
                                    status.error('Error:' + response.statusText + '(' + response.status + ')');
                                    resolve('err');
                                }
                            },
                            status,
                            r: () => {
                                resolve('err');
                            }
                        });
                    });
                    pro.then(function(curatorId) {
                        if (curatorId !== 'err' && callback) {
                            callback(developerName, curatorId);
                        }
                    });
                }
            },
            followDeveloper: function(r, developerName, isPublisher = 0) {
                this.getCuratorID(developerName, (developerName, curatorId) => {
                    let status = this.echoLog({
                        type: isPublisher ? 'followPublisher' : 'followDeveloper',
                        text: developerName
                    });
                    this.followCurator(r, curatorId, '1', status);
                }, isPublisher);

            },
            unfollowDeveloper: function(r, developerName, isPublisher = 0) {
                this.getCuratorID(developerName, (developerName, curatorId) => {
                    let status = this.echoLog({
                        type: isPublisher ? 'unfollowPublisher' : 'unfollowDeveloper',
                        text: developerName
                    });
                    this.followCurator(r, curatorId, '0', status);
                }, isPublisher);

            },
            followPublisher: function(r, publisherName) {
                this.followDeveloper(r, publisherName, 1);
            },
            unfollowPublisher: function(r, publisherName) {
                this.unfollowDeveloper(r, publisherName, 1);
            },
            addWishlist: function(r, gameId) {
                let status = this.echoLog({
                    type: 'addWishlist',
                    text: gameId
                });
                new Promise(resolve => {
                    this.httpRequest({
                        url: "https://store.steampowered.com/api/addtowishlist",
                        method: "POST",
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
                        },
                        data: $.param({
                            sessionid: steamInfo.storeSessionID,
                            appid: gameId
                        }),
                        dataType: 'json',
                        onload: function(response) {
                            if (debug) console.log(response);
                            if (response.status === 200 && response.response && response.response.success === true) {
                                status.success();
                                resolve({
                                    result: 'success',
                                    statusText: response.statusText,
                                    status: response.status
                                });
                            } else {
                                resolve({
                                    result: 'error',
                                    statusText: response.statusText,
                                    status: response.status
                                });
                            }
                        },
                        onabort: (response) => {
                            resolve({
                                result: 'error',
                                statusText: response.statusText,
                                status: response.status
                            })
                        },
                        onerror: (response) => {
                            resolve({
                                result: 'error',
                                statusText: response.statusText,
                                status: response.status
                            })
                        },
                        ontimeout: (response) => {
                            resolve({
                                result: 'error',
                                statusText: response.statusText,
                                status: response.status
                            })
                        },
                        r: resolve,
                        status
                    });
                }).then(result => {
                    if (result.result === 'success') {
                        r(result);
                    } else {
                        this.httpRequest({
                            url: "https://store.steampowered.com/app/" + gameId,
                            method: "GET",
                            onload: function(response) {
                                if (debug) console.log(response);
                                if (response.status === 200) {
                                    if (response.responseText.includes(`class="queue_actions_ctn"`) && response.responseText.includes('已在库中')) {
                                        status.success();
                                        r({
                                            result: 'success',
                                            statusText: response.statusText,
                                            status: response.status,
                                            own: true
                                        });
                                    } else if ((response.responseText.includes(`class="queue_actions_ctn"`) && response.responseText.includes('添加至您的愿望单')) || !response.responseText.includes(`class="queue_actions_ctn"`)) {
                                        status.error('Error:' + result.statusText + '(' + result.status + ')');
                                        r({
                                            result: 'error',
                                            statusText: response.statusText,
                                            status: response.status
                                        });
                                    } else {
                                        status.success();
                                        r({
                                            result: 'success',
                                            statusText: response.statusText,
                                            status: response.status
                                        });
                                    }
                                } else {
                                    status.error('Error:' + result.statusText + '(' + result.status + ')');
                                    r({
                                        result: 'error',
                                        statusText: response.statusText,
                                        status: response.status
                                    });
                                }
                            },
                            r,
                            status
                        });
                    }
                });
            },
            removeWishlist: function(r, gameId) {
                let status = this.echoLog({
                    type: 'removeWishlist',
                    text: gameId
                });
                new Promise(resolve => {
                    this.httpRequest({
                        url: "https://store.steampowered.com/api/removefromwishlist",
                        method: "POST",
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
                        },
                        data: $.param({
                            sessionid: steamInfo.storeSessionID,
                            appid: gameId
                        }),
                        dataType: 'json',
                        onload: function(response) {
                            if (debug) console.log(response);
                            if (response.status === 200 && response.response && response.response.success === true) {
                                status.success();
                                resolve({
                                    result: 'success',
                                    statusText: response.statusText,
                                    status: response.status
                                });
                            } else {
                                resolve({
                                    result: 'error',
                                    statusText: response.statusText,
                                    status: response.status
                                });
                            }
                        },
                        onabort: (response) => {
                            resolve({
                                result: 'error',
                                statusText: response.statusText,
                                status: response.status
                            })
                        },
                        onerror: (response) => {
                            resolve({
                                result: 'error',
                                statusText: response.statusText,
                                status: response.status
                            })
                        },
                        ontimeout: (response) => {
                            resolve({
                                result: 'error',
                                statusText: response.statusText,
                                status: response.status
                            })
                        },
                        r: resolve,
                        status
                    });
                }).then(result => {
                    if (result.result === 'success') {
                        r(result);
                    } else {
                        this.httpRequest({
                            url: "https://store.steampowered.com/app/" + gameId,
                            method: "GET",
                            onload: function(response) {
                                if (debug) console.log(response);
                                if (response.status === 200) {
                                    if (response.responseText.includes(`class="queue_actions_ctn"`) && (response.responseText.includes('已在库中') || response.responseText.includes('添加至您的愿望单'))) {
                                        status.success();
                                        r({
                                            result: 'success',
                                            statusText: response.statusText,
                                            status: response.status
                                        });
                                    } else {
                                        status.error('Error:' + result.statusText + '(' + result.status + ')');
                                        r({
                                            result: 'error',
                                            statusText: response.statusText,
                                            status: response.status
                                        });
                                    }
                                } else {
                                    status.error('Error:' + result.statusText + '(' + result.status + ')');
                                    r({
                                        result: 'error',
                                        statusText: response.statusText,
                                        status: response.status
                                    });
                                }
                            },
                            r,
                            status
                        });
                    }
                });
            },
            followGame: function(r, gameId) {
                let status = this.echoLog({
                    type: 'followGame',
                    text: gameId
                });
                new Promise(resolve => {
                    this.httpRequest({
                        url: "https://store.steampowered.com/explore/followgame/",
                        method: "POST",
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
                        },
                        data: $.param({
                            sessionid: steamInfo.storeSessionID,
                            appid: gameId
                        }),
                        onload: function(response) {
                            if (debug) console.log(response);
                            if (response.status === 200 && response.responseText === 'true') {
                                status.success();
                                resolve({
                                    result: 'success',
                                    statusText: response.statusText,
                                    status: response.status
                                });
                            } else {
                                resolve({
                                    result: 'error',
                                    statusText: response.statusText,
                                    status: response.status
                                });
                            }
                        },
                        onabort: (response) => {
                            resolve({
                                result: 'error',
                                statusText: response.statusText,
                                status: response.status
                            })
                        },
                        onerror: (response) => {
                            resolve({
                                result: 'error',
                                statusText: response.statusText,
                                status: response.status
                            })
                        },
                        ontimeout: (response) => {
                            resolve({
                                result: 'error',
                                statusText: response.statusText,
                                status: response.status
                            })
                        },
                        r: resolve,
                        status
                    });
                }).then(result => {
                    if (result.result === 'success') {
                        r(result);
                    } else {
                        this.httpRequest({
                            url: "https://store.steampowered.com/app/" + gameId,
                            method: "GET",
                            onload: function(response) {
                                if (debug) console.log(response);
                                if (response.status === 200) {
                                    if (response.responseText.includes(`class="queue_actions_ctn"`) && response.responseText.includes(`class="btnv6_blue_hoverfade btn_medium queue_btn_active" style="">`)) {
                                        status.success();
                                        r({
                                            result: 'success',
                                            statusText: response.statusText,
                                            status: response.status
                                        });
                                    } else {
                                        status.error('Error:' + result.statusText + '(' + result.status + ')');
                                        r({
                                            result: 'error',
                                            statusText: response.statusText,
                                            status: response.status
                                        });
                                    }
                                } else {
                                    status.error('Error:' + result.statusText + '(' + result.status + ')');
                                    r({
                                        result: 'error',
                                        statusText: response.statusText,
                                        status: response.status
                                    });
                                }
                            },
                            r,
                            status
                        });
                    }
                });
            },
            unfollowGame: function(r, gameId) {
                let status = this.echoLog({
                    type: 'unfollowGame',
                    text: gameId
                });
                new Promise(resolve => {
                    this.httpRequest({
                        url: "https://store.steampowered.com/explore/followgame/",
                        method: "POST",
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
                        },
                        data: $.param({
                            sessionid: steamInfo.storeSessionID,
                            appid: gameId,
                            unfollow: '1'
                        }),
                        onload: function(response) {
                            if (debug) console.log(response);
                            if (response.status === 200 && response.responseText === 'true') {
                                status.success();
                                resolve({
                                    result: 'success',
                                    statusText: response.statusText,
                                    status: response.status
                                });
                            } else {
                                resolve({
                                    result: 'error',
                                    statusText: response.statusText,
                                    status: response.status
                                });
                            }
                        },
                        onabort: (response) => {
                            resolve({
                                result: 'error',
                                statusText: response.statusText,
                                status: response.status
                            })
                        },
                        onerror: (response) => {
                            resolve({
                                result: 'error',
                                statusText: response.statusText,
                                status: response.status
                            })
                        },
                        ontimeout: (response) => {
                            resolve({
                                result: 'error',
                                statusText: response.statusText,
                                status: response.status
                            })
                        },
                        r: resolve,
                        status
                    });
                }).then(result => {
                    if (result.result === 'success') {
                        r(result);
                    } else {
                        this.httpRequest({
                            url: "https://store.steampowered.com/app/" + gameId,
                            method: "GET",
                            onload: function(response) {
                                if (debug) console.log(response);
                                if (response.status === 200) {
                                    if (response.responseText.includes(`class="queue_actions_ctn"`) && response.responseText.includes(`class="btnv6_blue_hoverfade btn_medium queue_btn_active" style="">`)) {
                                        status.error('Error:' + result.statusText + '(' + result.status + ')');
                                        r({
                                            result: 'error',
                                            statusText: response.statusText,
                                            status: response.status
                                        });
                                    } else {
                                        status.success();
                                        r({
                                            result: 'success',
                                            statusText: response.statusText,
                                            status: response.status
                                        });
                                    }
                                } else {
                                    status.error('Error:' + result.statusText + '(' + result.status + ')');
                                    r({
                                        result: 'error',
                                        statusText: response.statusText,
                                        status: response.status
                                    });
                                }
                            },
                            r,
                            status
                        });
                    }
                });
            },
            likeAnnouncements: function(r, url, id) {
                let status = this.echoLog({
                    type: 'likeAnnouncements',
                    url,
                    id
                });

                this.httpRequest({
                    url: url.replace('/detail/', '/rate/'),
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
                    },
                    data: $.param({
                        sessionid: steamInfo.communitySessionID,
                        voteup: true
                    }),
                    dataType: 'json',
                    onload: (response) => {
                        if (debug) console.log(response);
                        if (response.status === 200 && response.response && response.response.success === 1) {
                            status.success();
                            r({
                                result: 'success',
                                statusText: response.statusText,
                                status: response.status
                            });
                        } else {
                            status.error(`Error:${response.response.msg||response.statusText}(${response.response.success||response.status})`);
                            r({
                                result: 'error',
                                statusText: response.statusText,
                                status: response.status
                            });
                        }
                    },
                    r,
                    status
                });
            },
            getFinalUrl: function(r, url, options = {}) {
                let conf = {
                    url: options.url || url,
                    method: options.method || "GET",
                    onload: (response) => {
                        r({
                            result: 'success',
                            finalUrl: response.finalUrl,
                            url
                        });
                    },
                    r
                };
                if (options.headers) conf.headers = options.headers;
                if (options.data) conf.data = options.data;
                this.httpRequest(conf);
            },
            visitLink: function(r, url, options = {}) {
                let status = this.echoLog({
                    type: 'visitLink',
                    text: url
                });
                new Promise(resolve => {
                    this.getFinalUrl(resolve, url, options);
                }).then(() => {
                    status.warning('Complete');
                    r(1);
                })
            },
            forOrder: function({
                arr,
                callback,
                i = 0,
                time = 0,
                complete = false
            }) {
                if (complete) {
                    if (i < arr.length) {
                        callback({
                            arr,
                            i,
                            end: false
                        });
                    } else {
                        callback({
                            end: true
                        });
                    }
                } else {
                    if (i < arr.length) {
                        callback({
                            e: arr[i],
                            end: false
                        });
                        setTimeout(function() {
                            fuc.forOrder({
                                arr,
                                callback,
                                i: ++i,
                                time,
                                complete
                            })
                        }, time);
                    } else {
                        callback({
                            end: true
                        });
                    }
                }
            },
            checkUpdate: function(v, s = false) {
                v.icon = "el-icon-loading";
                let status = false;
                if (s) status = this.echoLog({
                    type: 'custom',
                    text: `<li>正在检测更新...<font></font></li>`
                });
                this.httpRequest({
                    url: "https://hclonely.github.io/auto-task/version?t=" + new Date().getTime(),
                    method: "get",
                    dataType: "json",
                    onload: (response) => {
                        if (debug) console.log(response);
                        if (response.response && response.response.version === GM_info.script.version) {
                            v.icon = "el-icon-refresh";
                            v.title = "检查更新";
                            if (s) status.success("当前脚本为最新版本！");
                            v.hidden = true;
                        } else if (response.response) {
                            v.icon = "el-icon-download";
                            v.title = "立即更新至" + response.response.version;
                            v.checkUpdate = function() {
                                window.open("https://hclonely.github.io/auto-task/auto-task.user.js", "_blank")
                            };
                            if (s) status.success("检测到新版本:" + response.response.version);
                            v.hidden = false;
                        } else {
                            v.icon = "el-icon-refresh";
                            v.title = "检查更新";
                            if (s) status.error("Error:" + (response.statusText || response.status));
                        }
                        let conf = GM_getValue("conf") || defaultConf;
                        if (response.response && response.response.time !== conf.announcement) {
                            v.announcementHidden = false;
                            conf.announcement = response.response.time;
                            GM_setValue("conf", conf);
                        }
                    },
                    ontimeout: (response) => {
                        if (debug) console.log(response);
                        v.icon = "el-icon-refresh";
                        v.title = "检查更新";
                        if (s) status.error("Error:Timeout(0)");
                    },
                    onabort: (response) => {
                        if (debug) console.log(response);
                        v.icon = "el-icon-refresh";
                        v.title = "检查更新";
                        if (s) status.error("Error:Abort(0)");
                    },
                    onerror: (response) => {
                        if (debug) console.log(response);
                        v.icon = "el-icon-refresh";
                        v.title = "检查更新";
                        if (s) status.error("Error:Error(0)");
                    },
                    status
                });
            },
            getAnnouncement: function(v) {
                v.announcementIcon = "el-icon-loading";
                let status = this.echoLog({
                    type: 'custom',
                    text: `<li>正在获取更新公告...<font></font></li>`
                });
                this.httpRequest({
                    url: "https://hclonely.github.io/auto-task/new.json?t=" + new Date().getTime(),
                    method: "get",
                    dataType: "json",
                    onload: (response) => {
                        if (debug) console.log(response);
                        if (response.responseText && response.response) {
                            status.success();
                            let data = response.response;
                            let conf = GM_getValue("conf") || defaultConf;
                            conf.announcement = data.time;
                            GM_setValue("conf", conf);
                            v.announcementHidden = true;
                            const h = vueUi.$createElement;
                            let hArr = [];
                            for (let index in data.text) {
                                hArr.push(h('p', null, `${parseInt(index)+1}.${data.text[index]}`));
                            }
                            vueUi.$msgbox({
                                title: `V${data.version}(${fuc.dateFormat("YYYY-mm-dd HH:MM",new Date(data.time))})`,
                                message: h('div', null, hArr),
                                showCancelButton: true,
                                confirmButtonText: '查看历史更新内容',
                                cancelButtonText: '关闭'
                            }).then(() => {
                                window.open("https://hclonely.github.io/auto-task/announcement.html", "_blank");
                            })
                        } else {
                            status.error("Error:" + (response.statusText || response.status));
                        }
                        v.announcementIcon = "el-icon-document";
                    },
                    ontimeout: (response) => {
                        if (debug) console.log(response);
                        v.announcementIcon = "el-icon-document";
                        status.error("Error:Timeout(0)");
                    },
                    onabort: (response) => {
                        if (debug) console.log(response);
                        v.announcementIcon = "el-icon-document";
                        status.error("Error:Abort(0)");
                    },
                    onerror: (response) => {
                        if (debug) console.log(response);
                        v.announcementIcon = "el-icon-document";
                        status.error("Error:Error(0)");
                    },
                    status
                });
            },
            newTabBlock: function() {
                let d = new Date();
                let cookiename = "haveVisited1";
                document.cookie = cookiename + "=1; path=/";
                document.cookie = cookiename + "=" + (d.getUTCMonth() + 1) + "/" + d.getUTCDate() + "/" + d.getUTCFullYear() + "; path=/";
            },
            creatSetting: function(settingName, header, fuckOptions, checkedFucks, removeOptions, checkedRemoves) {
                new Vue({
                    el: `#${settingName}`,
                    data: {
                        header: `${header}网站设置`,
                        checked: GM_getValue('conf') ? GM_getValue('conf')[settingName] ? (!!GM_getValue('conf')[settingName].load) : false : false,
                        fuck: {
                            checkAll: fuckOptions.length === checkedFucks.length,
                            checkedFucks: checkedFucks,
                            fucks: fuckOptions,
                            isIndeterminate: fuckOptions.length !== checkedFucks.length,
                        },
                        remove: {
                            checkAll: removeOptions.length === checkedRemoves.length,
                            checkedRemoves: checkedRemoves,
                            removes: removeOptions,
                            isIndeterminate: removeOptions.length !== checkedRemoves.length,
                        },
                        openDelay: 100,
                        rowType: "flex",
                        rowAlign: "middle",
                        verify: "1"
                    },
                    methods: {
                        fuckHandleCheckAllChange(val) {
                            this.fuck.checkedFucks = val ? fuckOptions.map(e => e.name) : [];
                            this.fuck.isIndeterminate = false;
                        },
                        handleCheckedFucksChange(value) {
                            let checkedCount = value.length;
                            this.fuck.checkAll = checkedCount === this.fuck.fucks.length;
                            this.fuck.isIndeterminate = checkedCount > 0 && checkedCount < this.fuck.fucks.length;
                        },
                        removeHandleCheckAllChange(val) {
                            this.remove.checkedRemoves = val ? removeOptions.map(e => e.name) : [];
                            this.remove.isIndeterminate = false;
                        },
                        handleCheckedRemovesChange(value) {
                            let checkedCount = value.length;
                            this.remove.checkAll = checkedCount === this.remove.removes.length;
                            this.remove.isIndeterminate = checkedCount > 0 && checkedCount < this.remove.removes.length;
                        }
                    }
                });
            },
            creatConf: function() {
                let confs = {};
                for (let div of $('div.setting')) {
                    let id = $(div).attr('id');
                    let conf = {};
                    for (let form of $(div).find('form')) {
                        let name = $(form).attr('name');
                        let setting = {};
                        for (let data of $(form).serializeArray()) {
                            setting[data.name] = 1;
                        }
                        conf[name] = setting;
                    }
                    confs[id] = conf;
                }
                for (let checkbox of $('.non-global input')) {
                    if ($(checkbox).is(":checked")) confs[$(checkbox).attr('name')].load = 1
                }
                let lotteryUserInfo = GM_getValue('conf') ? GM_getValue('conf').lotteryUserInfo : false;
                if (lotteryUserInfo) confs.lotteryUserInfo = lotteryUserInfo;
                let announcement = GM_getValue('conf') ? GM_getValue('conf').announcement : false;
                if (announcement) confs.announcement = announcement;
                return confs;
            },
            echoLog: function(e) {
                let ele = '';
                switch (e.type) {
                    case 'updateSteamCommunity':
                        ele = $(`<li>正在更新Steam社区SessionID(用于加组退组)...<font></font></li>`);
                        break;
                    case 'updateSteamStore':
                        ele = $(`<li>正在更新Steam商店SessionID(用于添加愿望单、关注游戏、关注鉴赏家等)...<font></font></li>`);
                        break;
                    case 'joinSteamGroup':
                        ele = $(`<li>正在加入Steam组<a href="https://steamcommunity.com/groups/${e.text}" target="_blank">${e.text}</a>...<font></font></li>`);
                        break;
                    case 'getGroupId':
                        ele = $(`<li>正在获取Steam组ID<a href="https://steamcommunity.com/groups/${e.text}" target="_blank">${e.text}</a>...<font></font></li>`);
                        break;
                    case 'leaveSteamGroup':
                        ele = $(`<li>正在退出Steam组<a href="https://steamcommunity.com/groups/${e.text}" target="_blank">${e.text}</a>...<font></font></li>`);
                        break;
                    case 'followCurator':
                        ele = $(`<li>正在关注鉴赏家<a href="https://store.steampowered.com/curator/${e.text}" target="_blank">${e.text}</a>...<font></font></li>`);
                        break;
                    case 'unfollowCurator':
                        ele = $(`<li>正在取关鉴赏家<a href="https://store.steampowered.com/curator/${e.text}" target="_blank">${e.text}</a>...<font></font></li>`);
                        break;
                    case 'getDeveloperId':
                        ele = $(`<li>正在获取开发商ID<a href="https://store.steampowered.com/developer/${e.text}" target="_blank">${e.text}</a>...<font></font></li>`);
                        break;
                    case 'followDeveloper':
                        ele = $(`<li>正在关注开发商<a href="https://store.steampowered.com/developer/${e.text}" target="_blank">${e.text}</a>...<font></font></li>`);
                        break;
                    case 'unfollowDeveloper':
                        ele = $(`<li>正在取关开发商<a href="https://store.steampowered.com/developer/${e.text}" target="_blank">${e.text}</a>...<font></font></li>`);
                        break;
                    case 'getPublisherId':
                        ele = $(`<li>正在获取发行商ID<a href="https://store.steampowered.com/publisher/${e.text}" target="_blank">${e.text}</a>...<font></font></li>`);
                        break;
                    case 'followPublisher':
                        ele = $(`<li>正在关注发行商<a href="https://store.steampowered.com/publisher/${e.text}" target="_blank">${e.text}</a>...<font></font></li>`);
                        break;
                    case 'unfollowPublisher':
                        ele = $(`<li>正在取关发行商<a href="https://store.steampowered.com/publisher/${e.text}" target="_blank">${e.text}</a>...<font></font></li>`);
                        break;
                    case 'addWishlist':
                        ele = $(`<li>正在添加愿望单<a href="https://store.steampowered.com/app/${e.text}" target="_blank">${e.text}</a>...<font></font></li>`);
                        break;
                    case 'removeWishlist':
                        ele = $(`<li>正在移除愿望单<a href="https://store.steampowered.com/app/${e.text}" target="_blank">${e.text}</a>...<font></font></li>`);
                        break;
                    case 'followGame':
                        ele = $(`<li>正在关注游戏<a href="https://store.steampowered.com/app/${e.text}" target="_blank">${e.text}</a>...<font></font></li>`);
                        break;
                    case 'unfollowGame':
                        ele = $(`<li>正在取关游戏<a href="https://store.steampowered.com/app/${e.text}" target="_blank">${e.text}</a>...<font></font></li>`);
                        break;
                    case 'likeAnnouncements':
                        ele = $(`<li>正在点赞通知<a href="${e.url}" target="_blank">${e.id}</a>...<font></font></li>`);
                        break;
                    case 'visitLink':
                        ele = $(`<li>正在访问页面<a href="${e.text}" target="_blank">${e.text}</a>...<font></font></li>`);
                        break;
                    case 'custom':
                        ele = $(e.text);
                        break;
                    default:
                        ele = $(`<li>未知操作...<font></font></li>`);
                        break;
                }
                $('.fuck-task-logs .el-notification__content').append(ele);
                ele[0].scrollIntoView();
                let font = ele.find('font');
                const status = {
                    font,
                    success: function(text = "Success") {
                        this.font.attr("class", "").addClass("success");
                        this.font.text(text);
                    },
                    error: function(text = "Error") {
                        this.font.attr("class", "").addClass("error");
                        this.font.text(text);
                    },
                    warning: function(text = "Warning") {
                        this.font.attr("class", "").addClass("warning");
                        this.font.text(text);
                    },
                    info: function(text = "Info") {
                        this.font.attr("class", "").addClass("info");
                        this.font.text(text);
                    },
                };
                return status;
            },
            unique: e => [...new Set(e)],
            getUrlQuery: function(url) {
                let q = {};
                if (url) {
                    if (url.includes("?")) {
                        url.split("?")[1].replace(/([^?&=]+)=([^&]+)/g, (_, k, v) => q[k] = v);
                    }
                } else {
                    location.search.replace(/([^?&=]+)=([^&]+)/g, (_, k, v) => q[k] = v);
                }
                return q;
            },
            dateFormat: function(fmt, date) {
                let ret;
                let opt = {
                    "Y+": date.getFullYear().toString(), // 年
                    "m+": (date.getMonth() + 1).toString(), // 月
                    "d+": date.getDate().toString(), // 日
                    "H+": date.getHours().toString(), // 时
                    "M+": date.getMinutes().toString(), // 分
                    "S+": date.getSeconds().toString() // 秒
                    // 有其他格式化字符需求可以继续添加，必须转化成字符串
                };
                for (let k in opt) {
                    ret = new RegExp("(" + k + ")").exec(fmt);
                    if (ret) {
                        fmt = fmt.replace(ret[1], (ret[1].length === 1) ? (opt[k]) : (opt[k].padStart(ret[1].length, "0")))
                    }
                }
                return fmt;
            }
        };

        const giveawaysu = {
            get_tasks: function(e) {
                //获取任务信息
                let taskInfo = GM_getValue('taskInfo[' + location.host + this.get_giveawayId() + ']');
                if (taskInfo && taskInfo !== '{"groups":[],"curators":[],"publishers":[],"developers":[],"fGames":[],"wGames":[],"announcements":[],"links":[],"toFinalUrl":{}}') {
                    this.taskInfo = taskInfo;
                    e === "doTask" ? this.do_task('join') : this.do_task('remove');
                } else {
                    let status = fuc.echoLog({
                        type: 'custom',
                        text: `<li>正在获取任务信息...<font></font></li>`
                    });
                    let tasks = $('#actions tr');
                    for (let task of tasks) {
                        let taskDes = $(task).find('td').eq(1).find('a:not([data-trigger="link"])');
                        let taskInfo = this.which_task(taskDes);
                        for (let info of taskInfo) {
                            if (info.name !== 'nonSteam' && this.taskInfo[info.name + 's']) {
                                this.taskInfo[info.name + 's'].push(info.link);
                                this.taskInfo.links.push(info.link);
                            }
                        }
                    }
                    status.success();
                    this.getFinalUrl(e);
                }
            },
            which_task: function(taskDes) {
                let taskInfo = [];
                let taskName = taskDes.text().trim();
                let link = taskDes.attr('href');
                if (/disable adblock|on facebook/gim.test(taskName)) {
                    return [{
                        name: 'nonSteam'
                    }];
                } else if (/join.*group/gim.test(taskName)) {
                    taskInfo.push({
                        name: 'group',
                        link
                    });
                    this.community = 1;
                } else if (/like.*announcement/gim.test(taskName)) {
                    taskInfo.push({
                        name: 'announcement',
                        link
                    });
                    this.community = 1;
                } else if (/follow.*publisher/gim.test(taskName)) {
                    taskInfo.push({
                        name: 'publisher',
                        link
                    });
                    this.store = 1;
                } else if (/follow.*developer/gim.test(taskName)) {
                    taskInfo.push({
                        name: 'developer',
                        link
                    });
                    this.store = 1;
                } else if (/follow.*curator|subscribe.*curator/gim.test(taskName)) {
                    taskInfo.push({
                        name: 'curator',
                        link
                    });
                    this.store = 1;
                } else {
                    if (/(Subscribe.*YouTube)|(Like.*YouTube)|(Follow.*Instagram)|(on twitter)|(Join.*Discord.*server)/gim.test(taskName)) {
                        this.links.push(link);
                    } else {
                        if (/wishlist.*game|add.*wishlist/gim.test(taskName)) {
                            taskInfo.push({
                                name: 'wGame',
                                link
                            });
                            this.store = 1;
                        }
                        if (/follow.*button/gim.test(taskName)) {
                            taskInfo.push({
                                name: 'fGame',
                                link
                            });
                            this.store = 1;
                        }
                    }
                    if (taskInfo.length === 0) return [{
                        name: 'nonSteam'
                    }];
                }
                return taskInfo;
            },
            getFinalUrl: function(e) {
                //处理任务链接
                let status = fuc.echoLog({
                    type: 'custom',
                    text: `<li>正在处理任务链接（用时取决于Steam任务数量，请耐心等待）...<font></font></li>`
                });
                let pro = [];
                for (let link of this.taskInfo.links) {
                    pro.push(new Promise(resolve => {
                        if (this.taskInfo.toFinalUrl[link]) {
                            resolve({
                                result: 'success'
                            });
                        } else {
                            fuc.getFinalUrl(resolve, link);
                        }
                    }));
                }
                Promise.all(pro).then(data => {
                    for (let r of data) {
                        if (r.finalUrl) {
                            this.taskInfo.toFinalUrl[r.url] = r.finalUrl;
                        }
                    }
                    //任务链接处理完成
                    GM_setValue('taskInfo[' + location.host + this.get_giveawayId() + ']', fuc.unique(this.taskInfo));
                    status.success();
                    if (debug) console.log(this);
                    e === "doTask" ? this.do_task('join') : this.do_task('remove');
                }).catch(error => {
                    status.error();
                    if (debug) console.log(error);
                });
            },
            do_task: function(act) {
                if (globalConf.other.autoOpen && act === 'join' && this.links.length > 0) {
                    for (let link of fuc.unique(this.links)) {
                        window.open(link, "_blank");
                    }
                }
                if ($("div.bind-discord").is(":visible")) $("div.bind-discord a")[0].click();
                new Promise(resolve => {
                    if (this.taskInfo.groups.length > 0 || this.taskInfo.announcements.length > 0) {
                        if (this.taskInfo.curators.length > 0 || this.taskInfo.publishers.length > 0 || this.taskInfo.developers.length > 0 || this.taskInfo.fGames.length > 0 || this.taskInfo.wGames.length > 0) {
                            fuc.updateSteamInfo(resolve, "all");
                        } else {
                            fuc.updateSteamInfo(resolve, "community");
                        }
                    } else if (this.taskInfo.curators.length > 0 || this.taskInfo.publishers.length > 0 || this.taskInfo.developers.length > 0 || this.taskInfo.fGames.length > 0 || this.taskInfo.wGames.length > 0) {
                        fuc.updateSteamInfo(resolve, "store");
                    } else {
                        resolve(1);
                    }
                }).then(s => {
                    if (s === 1) {
                        let pro = [];
                        for (let group of fuc.unique(this.taskInfo.groups)) {
                            if (this.taskInfo.toFinalUrl[group]) {
                                let groupName = this.taskInfo.toFinalUrl[group].match(/groups\/(.+)\/?/);
                                if (groupName) {
                                    pro.push(new Promise(resolve => {
                                        if (act === 'join' && this.conf.join.group) {
                                            fuc.joinSteamGroup(resolve, groupName[1]);
                                        } else if (act === 'remove' && this.conf.remove.group) {
                                            fuc.leaveSteamGroup(resolve, groupName[1]);
                                        } else {
                                            resolve(1);
                                        }
                                    }));
                                }
                            }
                        }
                        for (let curator of fuc.unique(this.taskInfo.curators)) {
                            if (this.taskInfo.toFinalUrl[curator]) {
                                let curatorId = this.taskInfo.toFinalUrl[curator].match(/curator\/([\d]+)/);
                                if (curatorId) {
                                    pro.push(new Promise(resolve => {
                                        if (act === 'join' && this.conf.join.curator) {
                                            fuc.followCurator(resolve, curatorId[1]);
                                        } else if (act === 'remove' && this.conf.remove.curator) {
                                            fuc.unfollowCurator(resolve, curatorId[1]);
                                        } else {
                                            resolve(1);
                                        }
                                    }));
                                }
                            }
                        }
                        for (let publisher of fuc.unique(this.taskInfo.publishers)) {
                            if (this.taskInfo.toFinalUrl[publisher]) {
                                let publisherName = this.taskInfo.toFinalUrl[publisher].includes('publisher') ? this.taskInfo.toFinalUrl[publisher].match(/publisher\/(.+)\/?/) : this.taskInfo.toFinalUrl[publisher].match(/pub\/(.+)\/?/);
                                if (publisherName) {
                                    pro.push(new Promise(resolve => {
                                        if (act === 'join' && this.conf.join.publisher) {
                                            fuc.followPublisher(resolve, publisherName[1]);
                                        } else if (act === 'remove' && this.conf.remove.publisher) {
                                            fuc.unfollowPublisher(resolve, publisherName[1]);
                                        } else {
                                            resolve(1);
                                        }
                                    }));
                                }
                            }
                        }
                        for (let developer of fuc.unique(this.taskInfo.developers)) {
                            if (this.taskInfo.toFinalUrl[developer]) {
                                let developerName = this.taskInfo.toFinalUrl[developer].includes('developer') ? this.taskInfo.toFinalUrl[developer].match(/developer\/(.+)\/?/) : this.taskInfo.toFinalUrl[developer].match(/dev\/(.+)\/?/);
                                if (developerName) {
                                    pro.push(new Promise(resolve => {
                                        if (act === 'join' && this.conf.join.developer) {
                                            fuc.followDeveloper(resolve, developerName[1]);
                                        } else if (act === 'remove' && this.conf.remove.developer) {
                                            fuc.unfollowDeveloper(resolve, developerName[1]);
                                        } else {
                                            resolve(1);
                                        }
                                    }));
                                }
                            }
                        }
                        for (let game of fuc.unique(this.taskInfo.fGames)) {
                            if (this.taskInfo.toFinalUrl[game]) {
                                let gameId = this.taskInfo.toFinalUrl[game].match(/app\/([\d]+)/);
                                if (gameId) {
                                    pro.push(new Promise(resolve => {
                                        if (act === 'join' && this.conf.join.followGame) {
                                            fuc.followGame(resolve, gameId[1]);
                                        } else if (act === 'remove' && this.conf.remove.unfollowGame) {
                                            fuc.unfollowGame(resolve, gameId[1]);
                                        } else {
                                            resolve(1);
                                        }
                                    }));
                                }
                            }
                        }
                        for (let game of fuc.unique(this.taskInfo.wGames)) {
                            if (this.taskInfo.toFinalUrl[game]) {
                                let gameId = this.taskInfo.toFinalUrl[game].match(/app\/([\d]+)/);
                                if (gameId) {
                                    pro.push(new Promise(resolve => {
                                        if (act === 'join' && this.conf.join.wishlist) {
                                            fuc.addWishlist(resolve, gameId[1]);
                                        } else if (act === 'remove' && this.conf.remove.wishlist) {
                                            fuc.removeWishlist(resolve, gameId[1]);
                                        } else {
                                            resolve(1);
                                        }
                                    }));
                                }
                            }
                        }
                        for (let announcement of fuc.unique(this.taskInfo.announcements)) {
                            if (this.taskInfo.toFinalUrl[announcement]) {
                                let announcementUrl = this.taskInfo.toFinalUrl[announcement];
                                let announcementId = announcementUrl.match(/announcements\/detail\/([\d]+)/);
                                if (announcementId) {
                                    if (act === 'join' && this.conf.join.announcement) {
                                        pro.push(new Promise(resolve => {
                                            fuc.likeAnnouncements(resolve, announcementUrl, announcementId[1]);
                                        }));
                                    }
                                }
                            }
                        }
                        Promise.all(pro).finally(data => {
                            fuc.echoLog({
                                type: 'custom',
                                text: `<li><font class="success">所有任务执行完成！</font></li>`
                            });
                            if (act === 'join') fuc.echoLog({
                                type: 'custom',
                                text: `<li><font class="warning">建议关闭脚本管理器和广告屏蔽插件再获取key！</font></li>`
                            });
                        });

                    }
                });
            },
            fuck: function() {},
            verify: function() {},
            join: function() {
                this.get_tasks("doTask");
            },
            remove: function() {
                this.get_tasks("remove");
            },
            get_giveawayId: function() {
                let id = location.href.match(/view\/([\d]+)/);
                if (id) {
                    return id[1];
                } else {
                    return location.href;
                }
            },
            checkLogin: function() {
                if ($("a.steam-login").length > 0) window.open("/steam/redirect", "_self");
            },
            checkLeft: function(ui) {
                if ($(".giveaway-ended").length > 0) {
                    ui.$confirm('此页面已经没有剩余key了, 是否关闭?', '提示', {
                        confirmButtonText: '确定',
                        cancelButtonText: '取消',
                        type: 'warning',
                        center: true
                    }).then(() => {
                        window.close();
                    });
                }
            },
            community: 0,
            store: 0,
            links: [], //非steam任务
            taskInfo: {
                groups: [], //任务需要加的组
                curators: [], //任务需要关注的鉴赏家
                publishers: [], //任务需要关注的发行商
                developers: [], //任务需要关注的开发商
                fGames: [], //任务需要关注的游戏
                wGames: [], //任务需要加愿望单的游戏
                announcements: [], //任务需要点赞的通知
                links: [], //原始链接
                toFinalUrl: {}, //链接转换
            },
            setting: {
                'fuck': false,
                'verify': false,
                'join': true,
                'remove': true
            },
            conf: GM_getValue('conf') ? ((GM_getValue('conf').giveawaysu && GM_getValue('conf').giveawaysu.load) ? GM_getValue('conf').giveawaysu : (GM_getValue('conf').global || defaultConf)) : defaultConf
        };

        const marvelousga = {
            fuck: function() {
                this.get_tasks('do_task');
            },
            get_tasks: function(callback = 'do_task') {
                let taskInfoHistory = GM_getValue('taskInfo[' + location.host + this.get_giveawayId() + ']');
                if (taskInfoHistory && taskInfoHistory !== '{"groups":[],"curators":[]}') this.taskInfo = taskInfoHistory;
                if (callback === 'remove' && taskInfoHistory && taskInfoHistory !== '{"groups":[],"curators":[]}') {
                    this.remove(true);
                } else {
                    this.tasks = [];
                    this.groups = [];
                    this.curators = [];
                    this.links = [];
                    let status = fuc.echoLog({
                        type: 'custom',
                        text: `<li>正在获取任务信息...<font></font></li>`
                    });

                    let tasksContainer = $('.container_task');
                    for (let task of tasksContainer) { //遍历任务信息
                        let taskDes = $(task).find('.card-body p.card-text.monospace');
                        let verifyBtn = $(task).find('button[id^=task_]:not(:contains(VERIFIED))');
                        if (/join[\w\W]*?steamcommunity.com\/groups/gim.test(taskDes.html())) { //加组任务
                            let groupName = taskDes.find('a[href*="steamcommunity.com/groups"]').attr("href").match(/steamcommunity.com\/groups\/([\w\d\-_]*)/)[1];
                            if (verifyBtn.length > 0) {
                                this.groups.push(groupName);
                            }
                            this.taskInfo.groups.push(groupName);
                        }
                        if (/follow[\w\W]*?store.steampowered.com\/curator/gim.test(taskDes.html())) { //关注鉴赏家任务
                            let curatorName = taskDes.find('a[href*="store.steampowered.com/curator"]').attr("href").match(/store.steampowered.com\/curator\/([\d]*)/)[1];
                            if (verifyBtn.length > 0) {
                                this.curators.push(curatorName);
                            }
                            this.taskInfo.curators.push(curatorName);
                        }
                        if (/visit.*?this.*?page/gim.test(taskDes.text()) && verifyBtn.length > 0) { //浏览页面任务
                            let pageUrl = taskDes.find('a[id^="task_webpage_clickedLink"]').attr("href");
                            this.links.push({
                                pageUrl: pageUrl,
                                taskId: verifyBtn.attr('id').split('_')[3]
                            });
                        }
                        if (verifyBtn.length > 0) { //任务验证信息
                            let provider = verifyBtn.attr('id').split('_')[1];
                            let taskRoute = verifyBtn.attr('id').split('_')[2];
                            let taskId = verifyBtn.attr('id').split('_')[3];
                            this.tasks.push({
                                provider,
                                taskRoute,
                                taskId,
                                taskDes: taskDes.html()
                            });
                        }
                    }
                    this.groups = fuc.unique(this.groups);
                    this.curators = fuc.unique(this.curators);
                    this.links = fuc.unique(this.links);
                    this.taskInfo.groups = fuc.unique(this.taskInfo.groups);
                    this.taskInfo.curators = fuc.unique(this.taskInfo.curators);
                    this.tasks = fuc.unique(this.tasks);
                    GM_setValue('taskInfo[' + location.host + this.get_giveawayId() + ']', this.taskInfo);
                    status.success();
                    if (debug) console.log(this);
                    if (callback === 'do_task') {
                        if (this.tasks.length === 0) {
                            fuc.echoLog({
                                type: 'custom',
                                text: `<li><font class="success">所有任务已完成！</font></li>`
                            });
                            if (this.conf.fuck.verify) this.verify();
                        } else {
                            this.do_task();
                        }
                    } else if (callback === 'verify') {
                        this.tasks.length > 0 ? this.verify(true) : fuc.echoLog({
                            type: 'custom',
                            text: `<li><font class="success">所有任务验证完成！</font></li>`
                        });
                    } else {
                        JSON.stringify(this.taskInfo) !== '{"groups":[],"curators":[]}' ? this.remove(true) : fuc.echoLog({
                            type: 'custom',
                            text: `<li><font class="warning">没有可以移除的任务！</font></li>`
                        });;
                    }
                }
            },
            do_task: function() {
                this.updateSteamInfo(() => {
                    let pro = [];
                    let groups = fuc.unique(this.groups);
                    let curators = fuc.unique(this.curators);
                    let links = fuc.unique(this.links);
                    if (this.conf.fuck.group) {
                        for (let group of groups) {
                            pro.push(new Promise((resolve) => {
                                fuc.joinSteamGroup(resolve, group);
                            }));
                        }
                    }
                    if (this.conf.fuck.curator) {
                        for (let curator of curators) {
                            pro.push(new Promise((resolve) => {
                                fuc.followCurator(resolve, curator);
                            }));
                        }
                    }
                    if (this.conf.fuck.visit) {
                        for (let link of links) {
                            pro.push(new Promise((resolve) => {
                                fuc.visitLink(resolve, link.pageUrl, {
                                    url: "/ajax/verifyTasks/webpage/clickedLink",
                                    method: 'POST',
                                    headers: {
                                        'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
                                        'x-csrf-token': $('meta[name="csrf-token"]').attr('content')
                                    },
                                    data: $.param({
                                        giveaway_slug: this.get_giveawayId(),
                                        giveaway_task_id: link.taskId
                                    })
                                });
                            }));
                        }
                    }
                    Promise.all(pro).finally(resolve => {
                        fuc.echoLog({
                            type: 'custom',
                            text: `<li><font class="success">所有任务已完成！</font></li>`
                        });
                        if (this.conf.fuck.verify) this.verify();
                    });
                })
            },
            verify: function(verify = false) {
                if (verify) {
                    let pro = [];
                    for (let task of fuc.unique(this.tasks)) {
                        let status = fuc.echoLog({
                            type: 'custom',
                            text: `<li>正在验证任务${task.taskDes}...<font></font></li>`
                        });
                        pro.push(new Promise((resolve) => {
                            fuc.httpRequest({
                                url: '/ajax/verifyTasks/' + task.provider + '/' + task.taskRoute,
                                method: 'POST',
                                dataType: 'json',
                                headers: {
                                    'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
                                    'x-csrf-token': $('meta[name="csrf-token"]').attr('content')
                                },
                                data: $.param({
                                    giveaway_slug: this.get_giveawayId(),
                                    giveaway_task_id: task.taskId
                                }),
                                onload: function(response) {
                                    if (debug) console.log(response);
                                    if (response.status === 200) {
                                        if (response.response.status === 1) {
                                            $(`#task_${task.provider}_${task.taskRoute}_${task.taskId}`).text("VERIFIED");
                                            status.success(response.response.percentageNanoBar.toFixed(2) + "%");
                                            resolve({
                                                result: 'success',
                                                statusText: response.statusText,
                                                status: response.status
                                            });
                                        } else {
                                            status.error('Error:' + (response.response.message || 'error'));
                                            if (globalConf.other.autoOpen) window.open($(task.taskDes).find("a").attr("href"), "_blank");
                                            resolve({
                                                result: 'error',
                                                statusText: response.statusText,
                                                status: response.status
                                            });
                                        }
                                    } else {
                                        status.error('Error:' + (response.response.message || response.statusText || response.status));
                                        if (globalConf.other.autoOpen) window.open($(task.taskDes).find("a").attr("href"), "_blank");
                                        resolve({
                                            result: 'error',
                                            statusText: response.statusText,
                                            status: response.status
                                        });
                                    }
                                },
                                r: resolve,
                                status
                            });
                        }));
                    }
                    Promise.all(pro).finally(resolve => {
                        fuc.echoLog({
                            type: 'custom',
                            text: `<li><font class="success">所有任务验证完成！</font><font class="warning">请手动完成<a id="google" href="javascript:void(0)" target="_self">谷歌验证</a>获取key!</font></li>`
                        });
                        $("#get_key_container").show();
                        $("#google").click(() => {
                            $("#get_key_container")[0].scrollIntoView()
                        });
                    });
                } else {
                    this.get_tasks('verify');
                }
            },
            remove: function(remove = false) {
                let pro = [];
                if (remove) {
                    this.updateSteamInfo(() => {
                        if (this.conf.remove.group) {
                            for (let group of fuc.unique(this.taskInfo.groups)) {
                                pro.push(new Promise((resolve) => {
                                    fuc.leaveSteamGroup(resolve, group);
                                }));
                            }
                        }
                        if (this.conf.remove.curator) {
                            for (let curator of fuc.unique(this.taskInfo.curators)) {
                                pro.push(new Promise((resolve) => {
                                    fuc.unfollowCurator(resolve, curator);
                                }));
                            }
                        }
                        Promise.all(pro).finally(data => {
                            fuc.echoLog({
                                type: 'custom',
                                text: `<li><font class="success">所有任务已完成！</font></li>`
                            });
                        });
                    });
                } else {
                    this.get_tasks('remove');
                }
            },
            get_giveawayId: function() {
                let id = $("#giveawaySlug").val() || location.href;
                return id;
            },
            updateSteamInfo: function(callback) {
                new Promise(resolve => {
                    if (this.taskInfo.groups.length > 0) {
                        if (this.taskInfo.curators.length > 0) {
                            fuc.updateSteamInfo(resolve, "all");
                        } else {
                            fuc.updateSteamInfo(resolve, "community");
                        }
                    } else if (this.taskInfo.curators.length > 0) {
                        fuc.updateSteamInfo(resolve, "store");
                    } else {
                        resolve(1);
                    }
                }).then(s => {
                    if (s === 1) {
                        callback();
                    }
                });
            },
            checkLogin: function() {
                if ($("a[href*=login]").length > 0) window.open("/login", "_self");
            },
            checkLeft: function(ui) {
                if ($("h3.text-danger:contains(this giveaway is closed)").length > 0) {
                    $("#link_to_click").remove();
                    ui.$confirm('此页面已经没有剩余key了, 是否关闭?', '提示', {
                        confirmButtonText: '确定',
                        cancelButtonText: '取消',
                        type: 'warning',
                        center: true
                    }).then(() => {
                        window.close();
                    });
                }
            },
            groups: [], //任务需要加的组
            curators: [], //任务需要关注的鉴赏家
            links: [], //需要浏览的页面链接
            taskInfo: {
                groups: [], //所有任务需要加的组
                curators: [], //所有任务需要关注的鉴赏家
            },
            tasks: [], //任务信息
            setting: {
                'fuck': true,
                'verify': true,
                'join': false,
                'remove': true
            },
            conf: GM_getValue('conf') ? ((GM_getValue('conf').marvelousga && GM_getValue('conf').marvelousga.load) ? GM_getValue('conf').marvelousga : (GM_getValue('conf').global || defaultConf)) : defaultConf
        };

        const banana = {
            fuck: function(vue) {
                let needBanana = $("p:contains('Collect'):contains('banana')");
                let needPoints = $("p:contains('Collect'):contains('point')");
                let msg = '';
                if (needBanana.length > 0) msg = "此key需要收集" + needBanana.text().match(/[\d]+/gim)[0] + "个香蕉！, 是否继续?";
                if (needPoints.length > 0) msg = "此key需要收集" + needPoints.text().replace(/Collect/gi, "") + ", 是否继续?";
                if (needPoints.length > 0 || needBanana.length > 0) {
                    vue.$confirm(msg, '提示', {
                        confirmButtonText: '确定',
                        cancelButtonText: '取消',
                        type: 'warning'
                    }).then(() => {
                        this.get_tasks('do_task');
                    }).catch(() => {});
                } else {
                    this.get_tasks('do_task');
                }
            },
            get_tasks: function(callback = 'do_task') {
                let taskInfoHistory = GM_getValue('taskInfo[' + location.host + this.get_giveawayId() + ']');
                if (taskInfoHistory && taskInfoHistory !== '{"groups":[],"curators":[],"wishlists":[],"fGames":[]}') this.taskInfo = taskInfoHistory;
                if (callback === 'remove' && taskInfoHistory && taskInfoHistory !== '{"groups":[],"curators":[],"wishlists":[],"fGames":[]}') {
                    this.remove(true);
                } else {
                    this.tasks = [];
                    this.links = [];
                    this.groups = [];
                    this.curators = [];
                    this.wishlists = [];
                    this.fGames = [];
                    this.taskIds = [];

                    let status = fuc.echoLog({
                        type: 'custom',
                        text: `<li>正在处理任务信息...<font></font></li>`
                    });

                    let tasksUl = $('ul.tasks li:not(:contains(Completed))');
                    let pro = [];
                    for (let task of tasksUl) { //遍历任务信息
                        let taskDes = $(task).find('p');
                        let verifyBtn = $(task).find('button:contains(Verify)');
                        let taskId = verifyBtn.length > 0 ? verifyBtn.attr('onclick').match(/\?verify=([\d]+)/) : '';
                        if (taskId) {
                            this.tasks.push({
                                taskId: taskId[1],
                                taskDes: taskDes.text()
                            });
                            if (/join.*?steam.*?group/gim.test(taskDes.text())) {
                                pro.push(new Promise(res => {
                                    new Promise(resolve => {
                                        fuc.getFinalUrl(resolve, location.origin + location.pathname + '?q=' + taskId[1]);
                                    }).then(r => {
                                        if (r.result === 'success') {
                                            let groupName = r.finalUrl.match(/groups\/(.+)\/?/);
                                            if (groupName) {
                                                this.groups.push(groupName[1]);
                                                this.taskInfo.groups.push(groupName[1]);
                                            } else {
                                                this.taskIds.push(taskId[1]);
                                            }
                                        } else {
                                            this.taskIds.push(taskId[1]);
                                        }
                                        res(1);
                                    });
                                }));
                            } else if (/follow.*?curator/gim.test(taskDes.text())) {
                                pro.push(new Promise(res => {
                                    new Promise(resolve => {
                                        fuc.getFinalUrl(resolve, location.origin + location.pathname + '?q=' + taskId[1]);
                                    }).then(r => {
                                        if (r.result === 'success') {
                                            let curatorId = r.finalUrl.match(/curator\/([\d]+)/);
                                            if (curatorId) {
                                                this.curators.push(curatorId[1]);
                                                this.taskInfo.curators.push(curatorId[1]);
                                            } else {
                                                this.taskIds.push(taskId[1]);
                                            }
                                        } else {
                                            this.taskIds.push(taskId[1]);
                                        }
                                        res(1);
                                    });
                                }));
                            } else if (/wishlist/gim.test(taskDes.text())) {
                                pro.push(new Promise(res => {
                                    new Promise(resolve => {
                                        fuc.getFinalUrl(resolve, location.origin + location.pathname + '?q=' + taskId[1]);
                                    }).then(r => {
                                        if (r.result === 'success') {
                                            let appId = r.finalUrl.match(/store.steampowered.com\/app\/([\d]+)/);
                                            if (appId) {
                                                this.wishlists.push(appId[1]);
                                                this.taskInfo.wishlists.push(appId[1]);
                                            } else {
                                                this.taskIds.push(taskId[1]);
                                            }
                                        } else {
                                            this.taskIds.push(taskId[1]);
                                        }
                                        res(1);
                                    });
                                }));
                            } else {
                                if (/(Subscribe.*channel)|(Retweet)|(Twitter)/gim.test(taskDes.text())) {
                                    if (!this.verifyBtn) this.verifyBtn = taskDes.find("button:first");
                                    if (callback === 'do_task' && globalConf.other.autoOpen) {
                                        taskDes.find("button")[0].click();
                                    }
                                }
                                pro.push(new Promise(res => {
                                    this.links.push(location.origin + location.pathname + '?q=' + taskId[1]);
                                    this.taskIds.push(taskId[1]);
                                    res(1);
                                }));
                            }
                        }
                    }
                    Promise.all(pro).finally(data => {
                        this.links = fuc.unique(this.links);
                        this.groups = fuc.unique(this.groups);
                        this.curators = fuc.unique(this.curators);
                        this.wishlists = fuc.unique(this.wishlists);
                        this.fGames = fuc.unique(this.fGames);
                        this.taskInfo.groups = fuc.unique(this.taskInfo.groups);
                        this.taskInfo.curators = fuc.unique(this.taskInfo.curators);
                        this.taskInfo.wishlists = fuc.unique(this.taskInfo.wishlists);
                        this.taskInfo.fGames = fuc.unique(this.taskInfo.fGames);
                        this.taskIds = fuc.unique(this.taskIds);
                        this.tasks = fuc.unique(this.tasks);
                        let taskInfoHistory = GM_getValue('taskInfo[' + location.host + this.get_giveawayId() + ']');
                        let taskInfo = taskInfoHistory ? [...taskInfoHistory, ...this.taskInfo] : this.taskInfo;
                        GM_setValue('taskInfo[' + location.host + this.get_giveawayId() + ']', fuc.unique(taskInfo));
                        status.success();
                        if (debug) console.log(this);
                        if (callback === 'do_task') {
                            this.do_task();
                        } else if (callback === 'verify') {
                            this.tasks.length > 0 ? this.verify(true) : fuc.echoLog({
                                type: 'custom',
                                text: `<li><font class="success">所有任务已完成！</font></li>`
                            });
                        } else {
                            JSON.stringify(this.taskInfo) !== '{"groups":[],"curators":[],"wishlists":[],"fGames":[]}' ? this.remove(true) : fuc.echoLog({
                                type: 'custom',
                                text: `<li><font class="warning">没有可以移除的任务！</font></li>`
                            });;
                        }
                    });
                }
            },
            do_task: function() {
                this.updateSteamInfo(() => {
                    let pro = [];
                    let groups = fuc.unique(this.groups);
                    let curators = fuc.unique(this.curators);
                    let wishlists = fuc.unique(this.wishlists);
                    let fGames = fuc.unique(this.fGames);
                    let links = fuc.unique(this.links);
                    if (this.conf.fuck.group) {
                        for (let group of groups) {
                            pro.push(new Promise((resolve) => {
                                fuc.joinSteamGroup(resolve, group);
                            }));
                        }
                    }
                    if (this.conf.fuck.curator) {
                        for (let curator of curators) {
                            pro.push(new Promise((resolve) => {
                                fuc.followCurator(resolve, curator);
                            }));
                        }
                    }
                    if (this.conf.fuck.wishlist) {
                        for (let gameId of wishlists) {
                            pro.push(new Promise((resolve) => {
                                fuc.addWishlist(resolve, gameId);
                            }));
                        }
                    }
                    if (this.conf.fuck.followGame) {
                        for (let gameId of fGames) {
                            pro.push(new Promise((resolve) => {
                                fuc.followGame(resolve, gameId);
                            }));
                        }
                    }
                    if (this.conf.fuck.visit) {
                        for (let link of links) {
                            pro.push(new Promise((resolve) => {
                                fuc.visitLink(resolve, link);
                            }));
                        }
                    }
                    Promise.all(pro).finally(resolve => {
                        fuc.echoLog({
                            type: 'custom',
                            text: `<li><font class="success">所有任务已完成！</font></li>`
                        });
                        if (this.conf.fuck.verify) this.verify();
                    });
                });
            },
            verify: function(verify = false) {
                if (verify) {
                    let pro = [];
                    for (let task of fuc.unique(this.tasks)) {
                        let status = fuc.echoLog({
                            type: 'custom',
                            text: `<li>正在验证任务${task.taskDes}...<font></font></li>`
                        });
                        pro.push(new Promise((resolve) => {
                            fuc.httpRequest({
                                url: location.origin + location.pathname + '?verify=' + task.taskId,
                                method: 'GET',
                                onload: function(response) {
                                    if (debug) console.log(response);
                                    status.warning('Complete');
                                    resolve({
                                        result: 'success',
                                        statusText: response.statusText,
                                        status: response.status
                                    });
                                },
                                r: resolve,
                                status
                            });
                        }));
                    }
                    Promise.all(pro).finally(resolve => {
                        fuc.echoLog({
                            type: 'custom',
                            text: `<li><font class="success">所有任务验证完成！</font></li>`
                        });
                        if (this.verifyBtn) {
                            this.verifyBtn.removeAttr("disabled")[0].click();
                        } else {
                            location.reload(true);
                        }
                    });
                } else {
                    this.get_tasks('verify');
                }
            },
            remove: function(remove = false) {
                let pro = [];
                if (remove) {
                    this.updateSteamInfo(() => {
                        if (this.conf.remove.group) {
                            for (let group of fuc.unique(this.taskInfo.groups)) {
                                pro.push(new Promise((resolve) => {
                                    fuc.leaveSteamGroup(resolve, group);
                                }));
                            }
                        }
                        if (this.conf.remove.curator) {
                            for (let curator of fuc.unique(this.taskInfo.curators)) {
                                pro.push(new Promise((resolve) => {
                                    fuc.unfollowCurator(resolve, curator);
                                }));
                            }
                        }
                        if (this.conf.remove.wishlist) {
                            for (let gameId of fuc.unique(this.taskInfo.wishlists)) {
                                pro.push(new Promise((resolve) => {
                                    fuc.removeWishlist(resolve, gameId);
                                }));
                            }
                        }
                        if (this.conf.remove.unfollowGame) {
                            for (let gameId of fuc.unique(this.taskInfo.fGames)) {
                                pro.push(new Promise((resolve) => {
                                    fuc.unfollowGame(resolve, gameId);
                                }));
                            }
                        }
                        Promise.all(pro).finally(data => {
                            fuc.echoLog({
                                type: 'custom',
                                text: `<li><font class="success">所有任务已完成！</font></li>`
                            });
                        });
                    });
                } else {
                    this.get_tasks('remove');
                }
            },
            get_giveawayId: function() {
                let id = location.href.match(/\/giveaway\/([\w\d\-]+)/);
                if (id) {
                    return id[1];
                } else {
                    return location.href;
                }
            },
            updateSteamInfo: function(callback) {
                new Promise(resolve => {
                    if (this.taskInfo.groups.length > 0) {
                        if (this.taskInfo.curators.length > 0 || this.taskInfo.fGames.length > 0 || this.taskInfo.wishlists.length > 0) {
                            fuc.updateSteamInfo(resolve, "all");
                        } else {
                            fuc.updateSteamInfo(resolve, "community");
                        }
                    } else if (this.taskInfo.curators.length > 0 || this.taskInfo.fGames.length > 0 || this.taskInfo.wishlists.length > 0) {
                        fuc.updateSteamInfo(resolve, "store");
                    } else {
                        resolve(1);
                    }
                }).then(s => {
                    if (s === 1) {
                        callback();
                    }
                });
            },
            checkLogin: function() {
                if ($("a.steam[title*=team]").length > 0) window.open("/giveaway/steam/", "_self");
            },
            checkLeft: function(ui) {
                if ($(".left b").text() === "0") {
                    ui.$confirm('此页面已经没有剩余key了, 是否关闭?', '提示', {
                        confirmButtonText: '确定',
                        cancelButtonText: '取消',
                        type: 'warning',
                        center: true
                    }).then(() => {
                        window.close();
                    });
                }
            },
            verifyBtn: 0,
            links: [], //需要浏览的页面链接
            groups: [], //所有任务需要加的组
            curators: [], //所有任务需要关注的鉴赏家
            wishlists: [], //所有务需要添加愿望单的游戏
            fGames: [], //所有任务需要关注的的游戏
            taskIds: [], //处理失败的任务
            taskInfo: {
                groups: [], //任务需要加的组
                curators: [], //任务需要关注的鉴赏家
                wishlists: [], //任务需要添加愿望单的游戏
                fGames: [], //任务需要关注的的游戏
            },
            tasks: [], //所有任务ID
            setting: {
                'fuck': true,
                'verify': true,
                'join': false,
                'remove': true
            },
            conf: GM_getValue('conf') ? ((GM_getValue('conf').banana && GM_getValue('conf').banana.load) ? GM_getValue('conf').banana : (GM_getValue('conf').global || defaultConf)) : defaultConf
        };

        const gamecode = {
            fuck: function() {
                this.get_tasks('do_task');
            },
            get_tasks: function(callback = 'do_task') {
                let status = fuc.echoLog({
                    type: 'custom',
                    text: `<li>正在获取任务信息...<font></font></li>`
                });
                let verifyBtns = $("[id^=listOfTasks_btnVerify]:not(:contains(VERIFIED))");
                let allVerifyBtns = $("[id^=listOfTasks_btnVerify]");
                if (callback === 'do_task') {
                    let taskInfo = GM_getValue('taskInfo[' + location.host + this.get_giveawayId() + ']');
                    if (taskInfo && taskInfo !== '{"groups":[]}') this.taskInfo = taskInfo;
                    this.groups = [];
                    for (let btn of verifyBtns) {
                        if ($(btn).attr('id').split('_')[4] === "joinGroup") {
                            let link = $(btn).parent().find("a[href*='steamcommunity.com/groups/']").attr("href");
                            let groupName = link.match(/groups\/(.+)\/?/);
                            if (groupName) {
                                this.groups.push(groupName[1]);
                            }
                        }
                    }
                    for (let btn of allVerifyBtns) {
                        if ($(btn).attr('id').split('_')[4] === "joinGroup") {
                            let link = $(btn).parent().find("a[href*='steamcommunity.com/groups/']").attr("href");
                            let groupName = link.match(/groups\/(.+)\/?/);
                            if (groupName) {
                                this.taskInfo.groups.push(groupName[1]);
                            }
                        }
                    }
                    this.groups = fuc.unique(this.groups);
                    this.taskInfo.groups = fuc.unique(this.taskInfo.groups);
                    GM_setValue('taskInfo[' + location.host + this.get_giveawayId() + ']', this.taskInfo);
                    if (this.groups.length > 0) {
                        this.do_task();
                    } else {
                        fuc.echoLog({
                            type: 'custom',
                            text: `<li><font class="success">所有任务已完成！</font></li>`
                        });
                        if (this.conf.fuck.verify) this.verify();
                    }
                } else if (callback === "verify") {
                    this.tasks = [];
                    for (let btn of verifyBtns) {
                        let id = $(btn).attr('id');
                        let index = id.split('_')[2];
                        switch (id.split('_')[3]) {
                            case 't':
                                if (id.split('_')[4] === 'followUser') {
                                    this.tasks.push({
                                        url: '/ajax/social/twitter/followUser',
                                        id: $("#task_id_" + index).val(),
                                        taskDes: $(btn).parent().find(".card-title").html()
                                    });
                                } else if (id.split('_')[4] === 'post') {
                                    this.tasks.push({
                                        url: '/ajax/social/twitter/postCheck',
                                        id: $("#task_id_" + index).val(),
                                        taskDes: $(btn).parent().find(".card-title").html()
                                    });
                                } else {
                                    this.tasks.push({
                                        url: getUrlTwitter($(btn)).replace("..", ""),
                                        id: $("#task_id_" + index).val(),
                                        taskDes: $(btn).parent().find(".card-title").html()
                                    });
                                }
                                break;
                            case 'others':
                                this.tasks.push({
                                    url: '/ajax/social/others/clicked',
                                    id: $("#task_id_" + index).val(),
                                    taskDes: $(btn).parent().find(".card-title").html()
                                });
                                break;
                            case 'w':
                                if (id.split('_')[4] === 'followChannel') {
                                    this.tasks.push({
                                        url: '/ajax/social/twitch/followCheck',
                                        id: $("#task_id_" + index).val(),
                                        taskDes: $(btn).parent().find(".card-title").html()
                                    });
                                } else {
                                    this.tasks.push({
                                        url: getUrlTwitch($(btn)).replace("..", ""),
                                        id: $("#task_id_" + index).val(),
                                        taskDes: $(btn).parent().find(".card-title").html()
                                    });
                                }
                                break;
                            case 'f':
                                if (id.split('_')[4] === 'like') {
                                    this.tasks.push({
                                        url: '/ajax/social/facebook/likePage',
                                        id: $("#task_id_" + index).val(),
                                        taskDes: $(btn).parent().find(".card-title").html()
                                    });
                                } else if (id.split('_')[4] === 'share') {
                                    this.tasks.push({
                                        url: '/ajax/social/facebook/shareContent',
                                        id: $("#task_id_" + index).val(),
                                        taskDes: $(btn).parent().find(".card-title").html()
                                    });
                                } else if (id.split('_')[4] === 'shareGiveaway') {
                                    this.tasks.push({
                                        url: '/ajax/social/facebook/shareThisGiveaway',
                                        id: $("#task_id_" + index).val(),
                                        taskDes: $(btn).parent().find(".card-title").html()
                                    });
                                } else {
                                    this.tasks.push({
                                        url: getUrlFacebook($(btn)).replace("..", ""),
                                        id: $("#task_id_" + index).val(),
                                        taskDes: $(btn).parent().find(".card-title").html()
                                    });
                                }
                                break;
                            case 's':
                                if (id.split('_')[4] === 'joinGroup') {
                                    this.tasks.push({
                                        url: '/ajax/social/steam/followGroup',
                                        id: $("#task_id_" + index).val(),
                                        taskDes: $(btn).parent().find(".card-title").html()
                                    });
                                } else if (id.split('_')[4] === 'playGame') {
                                    this.tasks.push({
                                        url: '/ajax/social/steam/playGame',
                                        id: $("#task_id_" + index).val(),
                                        taskDes: $(btn).parent().find(".card-title").html()
                                    });
                                } else if (id.split('_')[4] === 'gameLibrary') {
                                    this.tasks.push({
                                        url: '/ajax/social/steam/gameLibrary',
                                        id: $("#task_id_" + index).val(),
                                        taskDes: $(btn).parent().find(".card-title").html()
                                    });
                                } else {
                                    this.tasks.push({
                                        url: getUrlSteam($(btn)).replace("..", ""),
                                        id: $("#task_id_" + index).val(),
                                        taskDes: $(btn).parent().find(".card-title").html()
                                    });
                                }
                                break;
                            case 'y':
                                if (id.split('_')[4] === 'subscribeChannel') {
                                    this.tasks.push({
                                        url: '/ajax/social/youtube/subscribeChannel',
                                        id: $("#task_id_" + index).val(),
                                        taskDes: $(btn).parent().find(".card-title").html()
                                    });
                                } else if (id.split('_')[4] === 'likeVideo') {
                                    this.tasks.push({
                                        url: '/ajax/social/youtube/likeVideo',
                                        id: $("#task_id_" + index).val(),
                                        taskDes: $(btn).parent().find(".card-title").html()
                                    });
                                } else {
                                    this.tasks.push({
                                        url: getUrlYoutube($(btn)).replace("..", ""),
                                        id: $("#task_id_" + index).val(),
                                        taskDes: $(btn).parent().find(".card-title").html()
                                    });
                                }
                                break;
                            default:
                                this.tasks.push({
                                    url: 'unknown',
                                    id: $("#task_id_" + index).val(),
                                    taskDes: $(btn).parent().find(".card-title").html()
                                });
                        }
                    }
                    this.tasks = fuc.unique(this.tasks);
                    if (this.tasks.length > 0) {
                        this.verify(true);
                    } else {
                        fuc.echoLog({
                            type: 'custom',
                            text: `<li><font class="success">所有任务验证完成！</font></li>`
                        });
                    }
                } else if (callback === "remove") {
                    let taskInfo = GM_getValue('taskInfo[' + location.host + this.get_giveawayId() + ']');
                    if (taskInfo && taskInfo !== '{"groups":[]}') {
                        this.taskInfo = taskInfo;
                        this.remove(true);
                    } else {
                        for (let btn of allVerifyBtns) {
                            if ($(btn).attr('id').split('_')[4] === "joinGroup") {
                                let link = $(btn).parent().find("a[href*='steamcommunity.com/groups/']").attr("href");
                                let groupName = link.match(/groups\/(.+)\/?/);
                                if (groupName) {
                                    this.taskInfo.groups.push(groupName[1]);
                                }
                            }
                        }
                        this.taskInfo.groups = fuc.unique(this.taskInfo.groups);
                        GM_setValue('taskInfo[' + location.host + this.get_giveawayId() + ']', this.taskInfo);
                        if (this.taskInfo.groups.length > 0) {
                            this.remove(true);
                        } else {
                            fuc.echoLog({
                                type: 'custom',
                                text: `<li><font class="success">没有可以移除的任务！</font></li>`
                            });
                        }
                    }
                } else {
                    fuc.echoLog({
                        type: 'custom',
                        text: `<li><font class="error">未知操作！</font></li>`
                    });
                }
                status.success();
                if (debug) console.log(this);
            },
            do_task: function() {
                this.updateSteamInfo(() => {
                    let pro = [];
                    let groups = fuc.unique(this.groups);
                    if (this.conf.fuck.group) {
                        for (let group of groups) {
                            pro.push(new Promise((resolve) => {
                                fuc.joinSteamGroup(resolve, group);
                            }));
                        }
                    }
                    Promise.all(pro).finally(resolve => {
                        fuc.echoLog({
                            type: 'custom',
                            text: `<li><font class="success">所有任务已完成！</font></li>`
                        });
                        if (this.conf.fuck.verify) this.verify();
                    });
                });
            },
            verify: function(verify = false) {
                if (verify) {
                    let pro = [];
                    for (let task of fuc.unique(this.tasks)) {
                        let status = fuc.echoLog({
                            type: 'custom',
                            text: `<li>正在验证任务${task.taskDes}...<font></font></li>`
                        });
                        pro.push(new Promise((resolve) => {
                            fuc.httpRequest({
                                url: task.url,
                                method: 'POST',
                                dataType: 'json',
                                headers: {
                                    'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
                                    'x-csrf-token': $('meta[name="csrf-token"]').attr('content')
                                },
                                data: $.param({
                                    giveawayID: this.get_giveawayId(),
                                    taskID: task.id
                                }),
                                onload: function(response) {
                                    if (debug) console.log(response);
                                    if (response.status === 200) {
                                        if (response.response.status === 1) {
                                            $(`input[value=${task.id}]`).parent().find("button[id^=listOfTasks_btnVerify_]").text("VERIFIED");
                                            status.success((parseInt(response.response.nDoneTasks) / parseInt(totalTasks) * 100).toFixed(2) + "%");
                                            resolve({
                                                result: 'success',
                                                statusText: response.statusText,
                                                status: response.status
                                            });
                                        } else {
                                            status.error('Error:' + (response.response.message || 'error'));
                                            if (globalConf.other.autoOpen) window.open(task.url, "_blank");
                                            resolve({
                                                result: 'error',
                                                statusText: response.statusText,
                                                status: response.status
                                            });
                                        }
                                    } else {
                                        status.error('Error:' + (response.response.message || response.statusText || response.status));
                                        if (globalConf.other.autoOpen) window.open(task.url, "_blank");
                                        resolve({
                                            result: 'error',
                                            statusText: response.statusText,
                                            status: response.status
                                        });
                                    }
                                },
                                r: resolve,
                                status
                            });
                        }));
                    }
                    Promise.all(pro).finally(resolve => {
                        fuc.echoLog({
                            type: 'custom',
                            text: `<li><font class="success">所有任务验证完成！</font><font class="warning">请手动完成<a id="google" href="javascript:void(0)" target="_self">谷歌验证</a>获取key!</font></li>`
                        });
                        $("#google").click(() => {
                            $("#captcha")[0].scrollIntoView()
                        });
                    });
                } else {
                    this.get_tasks('verify');
                }
            },
            remove: function(remove = false) {
                let pro = [];
                if (remove) {
                    this.updateSteamInfo(() => {
                        if (this.conf.remove.group) {
                            for (let group of fuc.unique(this.taskInfo.groups)) {
                                pro.push(new Promise((resolve) => {
                                    fuc.leaveSteamGroup(resolve, group);
                                }));
                            }
                        }
                        Promise.all(pro).finally(data => {
                            fuc.echoLog({
                                type: 'custom',
                                text: `<li><font class="success">所有任务已完成！</font></li>`
                            });
                        });
                    });
                } else {
                    this.get_tasks('remove');
                }
            },
            get_giveawayId: function() {
                let id = $("#giveawayID").val() || location.href;
                return id;
            },
            updateSteamInfo: function(callback) {
                new Promise(resolve => {
                    if (this.taskInfo.groups.length > 0) {
                        fuc.updateSteamInfo(resolve, "community");
                    } else {
                        resolve(1);
                    }
                }).then(s => {
                    if (s === 1) {
                        callback();
                    }
                });
            },
            checkLogin: function() {
                if ($("a.steam[title*=team]").length > 0) window.open("/login", "_self");
            },
            checkLeft: function(ui) {
                if ($(".text-danger:contains(this giveaway is closed)").length > 0) {
                    $("#link_to_click").remove();
                    ui.$confirm('此页面已经没有剩余key了, 是否关闭?', '提示', {
                        confirmButtonText: '确定',
                        cancelButtonText: '取消',
                        type: 'warning',
                        center: true
                    }).then(() => {
                        window.close();
                    });
                }
            },
            groups: [], //任务需要加的组
            taskInfo: {
                groups: [], //所有任务需要加的组
            },
            tasks: [], //任务信息
            setting: {
                'fuck': true,
                'verify': true,
                'join': false,
                'remove': true
            },
            conf: GM_getValue('conf') ? ((GM_getValue('conf').gamecode && GM_getValue('conf').gamecode.load) ? GM_getValue('conf').gamecode : (GM_getValue('conf').global || defaultConf)) : defaultConf
        };

        const gamehag = {
            fuck: function() {
                this.get_tasks('do_task');
            },
            get_tasks: function(callback = 'do_task') {
                let status = fuc.echoLog({
                    type: 'custom',
                    text: `<li>正在获取任务信息...<font></font></li>`
                });
                let verifyBtns = $("button[data-id]");
                if (callback === 'do_task') {
                    let taskInfo = GM_getValue('taskInfo[' + location.host + this.get_giveawayId() + ']');
                    if (taskInfo && taskInfo !== '{"groups":[]}') this.taskInfo = taskInfo;
                    this.groups = [];
                    this.tasks = [];
                    for (let btn of verifyBtns) {
                        let taskId = $(btn).attr("data-id");
                        let taskDes = $(btn).parent().prev().text();
                        if ($(btn).parents(".task-content").next().text().includes("+1")) this.tasks.push({
                            taskId,
                            taskDes
                        });
                    }
                    if ($("a.giveaway-survey").length > 0) {
                        let taskId = $("a.giveaway-survey").attr("data-task_id");
                        let taskDes = "Complete the survey";
                        this.tasks.push({
                            taskId,
                            taskDes
                        });
                    }
                    this.groups = fuc.unique(this.groups);
                    this.taskInfo.groups = fuc.unique(this.taskInfo.groups);
                    this.tasks = fuc.unique(this.tasks);
                    GM_setValue('taskInfo[' + location.host + this.get_giveawayId() + ']', this.taskInfo);
                    if (this.tasks.length > 0) {
                        this.do_task();
                    } else {
                        fuc.echoLog({
                            type: 'custom',
                            text: `<li><font class="success">所有任务已完成！</font></li>`
                        });
                        if (this.conf.fuck.verify) this.verify();
                    }
                } else if (callback === "verify") {
                    this.tasks = [];
                    for (let btn of verifyBtns) {
                        let taskId = $(btn).attr("data-id");
                        let taskDes = $(btn).parent().prev().text();
                        if ($(btn).parents(".task-content").next().text().includes("+1")) this.tasks.push({
                            taskId,
                            taskDes
                        });
                    }
                    this.tasks = fuc.unique(this.tasks);
                    if (this.tasks.length > 0) {
                        this.verify(true);
                    } else {
                        fuc.echoLog({
                            type: 'custom',
                            text: `<li><font class="success">所有任务验证完成！</font></li>`
                        });
                    }
                } else if (callback === "remove") {
                    fuc.echoLog({
                        type: 'custom',
                        text: `<li><font class="success">没有可以移除的任务！</font></li>`
                    });
                } else {
                    fuc.echoLog({
                        type: 'custom',
                        text: `<li><font class="error">未知操作！</font></li>`
                    });
                }
                status.success();
                if (debug) console.log(this);
            },
            do_task: function() {
                let pro = [];
                let tasks = fuc.unique(this.tasks);
                fuc.forOrder({
                    arr: tasks,
                    time: 500,
                    callback: ({
                        e,
                        end
                    }) => {
                        if (!end) {
                            let task = e;
                            pro.push(new Promise((resolve) => {
                                fuc.visitLink(resolve, "/giveaway/click/" + task.taskId, {
                                    headers: {
                                        'x-csrf-token': $('meta[name="csrf-token"]').attr('content')
                                    }
                                });
                            }));
                            if (/play.*?games/gim.test(task.taskDes)) {
                                pro.push(new Promise((resolve) => {
                                    fuc.visitLink(resolve, "/games", {
                                        headers: {
                                            'x-csrf-token': $('meta[name="csrf-token"]').attr('content')
                                        }
                                    });
                                }));
                                pro.push(new Promise((resolve) => {
                                    fuc.visitLink(resolve, "/games/war-thunder/play", {
                                        headers: {
                                            'x-csrf-token': $('meta[name="csrf-token"]').attr('content')
                                        }
                                    });
                                }));
                            }
                        } else {
                            Promise.all(pro).finally(resolve => {
                                fuc.echoLog({
                                    type: 'custom',
                                    text: `<li><font class="success">所有任务已完成！</font></li>`
                                });
                                if (this.conf.fuck.verify) this.verify();
                            });
                        }
                    }
                });
            },
            verify: function(verify = false) {
                if (verify) {
                    let pro = [];
                    fuc.forOrder({
                        arr: fuc.unique(this.tasks),
                        time: 500,
                        callback: ({
                            e,
                            end
                        }) => {
                            if (!end) {
                                let task = e;
                                let status = fuc.echoLog({
                                    type: 'custom',
                                    text: `<li>正在验证任务<a href="/giveaway/click/${task.taskId}" target="_blank">${task.taskDes.trim()}</a>...<font></font></li>`
                                });
                                pro.push(new Promise((resolve) => {
                                    fuc.httpRequest({
                                        url: '/api/v1/giveaway/sendtask',
                                        method: 'POST',
                                        dataType: 'json',
                                        headers: {
                                            'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
                                            'x-csrf-token': $('meta[name="csrf-token"]').attr('content')
                                        },
                                        data: 'task_id=' + task.taskId,
                                        onload: function(response) {
                                            if (debug) console.log(response);
                                            if (response.response) {
                                                if (response.response.status === "success") {
                                                    status.success();
                                                    $(`div.task-reward[href="#task-${task.taskId}-collapse"]`).html(`<svg class="nc-icon nc-align-to-text grid-24 glyph"><use xlink:href="/icons/nci-fill.svg#nc-icon-check-simple" /></svg>`);
                                                    resolve({
                                                        result: 'success',
                                                        statusText: response.statusText,
                                                        status: response.status
                                                    });
                                                } else {
                                                    status.error('Error:' + (response.response.message || response.statusText || response.status || 'error'));
                                                    if (globalConf.other.autoOpen) window.open(`/giveaway/click/${task.taskId}`, "_blank");
                                                    resolve({
                                                        result: 'error',
                                                        statusText: response.statusText,
                                                        status: response.status
                                                    });
                                                }
                                            } else {
                                                status.error('Error:' + response.statusText);
                                                resolve({
                                                    result: 'error',
                                                    statusText: response.statusText,
                                                    status: response.status
                                                });
                                            }
                                        },
                                        r: resolve,
                                        status
                                    });
                                }));
                            } else {
                                Promise.all(pro).finally(resolve => {
                                    fuc.echoLog({
                                        type: 'custom',
                                        text: `<li><font class="success">所有任务验证完成！</font></li>`
                                    });
                                });
                            }
                        }
                    });
                } else {
                    this.get_tasks('verify');
                }
            },
            remove: function(remove = false) {
                fuc.echoLog({
                    type: 'custom',
                    text: `<li><font class="success">没有可以移除的任务！</font></li>`
                });
            },
            get_giveawayId: function() {
                let id = location.href.match(/\/giveaway\/([\d]+)/);
                if (id) {
                    return id[1];
                } else {
                    return location.href;
                }
            },
            checkLogin: function() {},
            checkLeft: function(ui) {
                if ($(".giveaway-counter:first .strong").text() === "0") {
                    ui.$confirm('此页面已经没有剩余key了, 是否关闭?', '提示', {
                        confirmButtonText: '确定',
                        cancelButtonText: '取消',
                        type: 'warning',
                        center: true
                    }).then(() => {
                        window.close();
                    });
                }
            },
            groups: [], //任务需要加的组
            taskInfo: {
                groups: [], //所有任务需要加的组
            },
            tasks: [], //任务信息
            setting: {
                'fuck': true,
                'verify': true,
                'join': false,
                'remove': true
            },
            conf: GM_getValue('conf') ? ((GM_getValue('conf').gamehag && GM_getValue('conf').gamehag.load) ? GM_getValue('conf').gamehag : (GM_getValue('conf').global || defaultConf)) : defaultConf
        };

        const prys = {
            fuck: function() {
                this.get_tasks('do_task');
            },
            get_tasks: function(callback = 'do_task') {
                let status = fuc.echoLog({
                    type: 'custom',
                    text: `<li>正在获取任务信息...<font></font></li>`
                });
                let steps = $("#steps tbody tr");
                for (let i = 0; i < steps.length; i++) {
                    if (steps.eq(i).find("span:contains(Success)").length === 0) checkClick(i);
                }
                if (callback === 'do_task') {
                    let taskInfoHistory = GM_getValue('taskInfo[' + location.host + this.get_giveawayId() + ']');
                    if (taskInfoHistory && taskInfoHistory !== '{"groups":[],"curators":[]}') this.taskInfo = taskInfoHistory;
                    this.groups = [];
                    this.curators = [];
                    let pro = [];
                    for (let step of steps) {
                        if ($(step).find("span:contains(Success)").length === 0) {
                            if ($(step).find("a[href*='store.steampowered.com/curator/']").length > 0) {
                                let link = $(step).find("a[href*='store.steampowered.com/curator/']").attr('href');
                                let curatorId = link.match(/curator\/([\d]+)/);
                                if (curatorId) {
                                    this.curators.push(curatorId[1]);
                                    this.taskInfo.curators.push(curatorId[1]);
                                }
                            } else if ($(step).find("a[href*='steampowered.com/groups/']").length > 0) {
                                let link = $(step).find("a[href*='steampowered.com/groups/']").attr('href');
                                let groupName = link.match(/groups\/(.+)\/?/);
                                if (groupName) {
                                    this.groups.push(groupName[1]);
                                    this.taskInfo.groups.push(groupName[1]);
                                }
                            } else if ($(step).find("a[href*='steamcommunity.com/gid']").length > 0) {
                                let link = $(step).find("a[href*='steamcommunity.com/gid']").attr('href');
                                pro.push(new Promise(r => {
                                    new Promise(resolve => {
                                        fuc.getFinalUrl(resolve, link);
                                    }).then(data => {
                                        if (data.result === 'success') {
                                            let groupName = data.finalUrl.match(/groups\/(.+)\/?/);
                                            if (groupName) {
                                                this.groups.push(groupName[1]);
                                                this.taskInfo.groups.push(groupName[1]);
                                            }
                                        }
                                        r(1);
                                    });
                                }));
                            }
                        }
                    }
                    if (pro.length > 0) {
                        Promise.all(pro).finally(data => {
                            this.groups = fuc.unique(this.groups);
                            this.curators = fuc.unique(this.curators);
                            this.taskInfo.groups = fuc.unique(this.taskInfo.groups);
                            this.taskInfo.curators = fuc.unique(this.taskInfo.curators);
                            GM_setValue('taskInfo[' + location.host + this.get_giveawayId() + ']', this.taskInfo);
                            if (this.groups.length > 0 || this.curators.length > 0) {
                                this.do_task();
                            } else {
                                fuc.echoLog({
                                    type: 'custom',
                                    text: `<li><font class="success">所有任务已完成！</font></li>`
                                });
                                if (this.conf.fuck.verify) this.verify();
                            }
                        });
                    } else {
                        this.groups = fuc.unique(this.groups);
                        this.curators = fuc.unique(this.curators);
                        this.taskInfo.groups = fuc.unique(this.taskInfo.groups);
                        this.taskInfo.curators = fuc.unique(this.taskInfo.curators);
                        GM_setValue('taskInfo[' + location.host + this.get_giveawayId() + ']', this.taskInfo);
                        if (this.groups.length > 0 || this.curators.length > 0) {
                            this.do_task();
                        } else {
                            fuc.echoLog({
                                type: 'custom',
                                text: `<li><font class="success">所有任务已完成！</font></li>`
                            });
                            if (this.conf.fuck.verify) this.verify();
                        }
                    }
                } else if (callback === "verify") {
                    this.tasks = [];
                    let checks = $("#steps tbody a[id^=check]");
                    if (checks.length > 0) {
                        for (let check of checks) {
                            let id = $(check).attr('id').match(/[\d]+/);
                            if (id) this.tasks.push({
                                id: id[0],
                                taskDes: $(check).parent().prev().html().trim()
                            })
                        }
                        this.verify(true);
                    } else {
                        fuc.echoLog({
                            type: 'custom',
                            text: `<li><font class="success">所有任务验证完成，请手动完成人机验证获取key!</font></li>`
                        });
                        //fuc.echoLog({type: 'custom', text: `<li><font class="warning">如果没有显示人机验证，说明有的任务显示成功实际上没完成，请刷新页面查看并手动完成!</font></li>`});
                    }
                } else if (callback === "remove") {
                    let taskInfo = GM_getValue('taskInfo[' + location.host + this.get_giveawayId() + ']');
                    if (taskInfo && taskInfo !== '{"groups":[],"curators":[]}') {
                        this.taskInfo = taskInfo;
                        this.remove(true);
                    } else {
                        let pro = [];
                        for (let step of steps) {
                            if ($(step).find("a[href*='store.steampowered.com/curator/']").length > 0) {
                                let link = $(step).find("a[href*='store.steampowered.com/curator/']").attr('href');
                                let curatorId = link.match(/curator\/([\d]+)/);
                                if (curatorId) {
                                    this.taskInfo.curators.push(curatorId[1]);
                                }
                            } else if ($(step).find("a[href*='steampowered.com/groups/']").length > 0) {
                                let link = $(step).find("a[href*='steampowered.com/groups/']").attr('href');
                                let groupName = link.match(/groups\/(.+)\/?/);
                                if (groupName) {
                                    this.taskInfo.groups.push(groupName[1]);
                                }
                            } else if ($(step).find("a[href*='steamcommunity.com/gid']").length > 0) {
                                let link = $(step).find("a[href*='steamcommunity.com/gid']").attr('href');
                                pro.push(new Promise(r => {
                                    new Promise(resolve => {
                                        fuc.getFinalUrl(resolve, link);
                                    }).then(data => {
                                        if (data.result === 'success') {
                                            let groupName = data.finalUrl.match(/groups\/(.+)\/?/);
                                            if (groupName) {
                                                this.taskInfo.groups.push(groupName[1]);
                                            }
                                        }
                                        r(1);
                                    });
                                }));
                            }
                        }
                        if (pro.length > 0) {
                            Promise.all(pro).finally(data => {
                                this.taskInfo.groups = fuc.unique(this.taskInfo.groups);
                                this.taskInfo.curators = fuc.unique(this.taskInfo.curators);
                                GM_setValue('taskInfo[' + location.host + this.get_giveawayId() + ']', this.taskInfo);
                                if (this.taskInfo.groups.length > 0 || this.taskInfo.curators.length > 0) {
                                    this.remove(true);
                                } else {
                                    fuc.echoLog({
                                        type: 'custom',
                                        text: `<li><font class="success">没有可以移除的任务！</font></li>`
                                    });
                                }
                            });
                        } else {
                            this.taskInfo.groups = fuc.unique(this.taskInfo.groups);
                            this.taskInfo.curators = fuc.unique(this.taskInfo.curators);
                            GM_setValue('taskInfo[' + location.host + this.get_giveawayId() + ']', this.taskInfo);
                            if (this.taskInfo.groups.length > 0 || this.taskInfo.curators.length > 0) {
                                this.remove(true);
                            } else {
                                fuc.echoLog({
                                    type: 'custom',
                                    text: `<li><font class="success">没有可以移除的任务！</font></li>`
                                });
                            }
                        }
                    }
                } else {
                    fuc.echoLog({
                        type: 'custom',
                        text: `<li><font class="error">未知操作！</font></li>`
                    });
                }
                status.success();
                if (debug) console.log(this);
            },
            do_task: function() {
                this.updateSteamInfo(() => {
                    let pro = [];
                    let groups = fuc.unique(this.groups);
                    let curators = fuc.unique(this.curators);
                    if (this.conf.fuck.group) {
                        for (let group of groups) {
                            pro.push(new Promise((resolve) => {
                                fuc.joinSteamGroup(resolve, group);
                            }));
                        }
                    }
                    if (this.conf.fuck.curator) {
                        for (let curator of curators) {
                            pro.push(new Promise((resolve) => {
                                fuc.followCurator(resolve, curator);
                            }));
                        }
                    }
                    Promise.all(pro).finally(resolve => {
                        fuc.echoLog({
                            type: 'custom',
                            text: `<li><font class="success">所有任务已完成！</font></li>`
                        });
                        if (this.conf.fuck.verify) this.verify();
                    });
                });
            },
            verify: function(verify = false) {
                if (verify) {
                    let pro = [];
                    for (let task of fuc.unique(this.tasks)) {
                        let status = fuc.echoLog({
                            type: 'custom',
                            text: `<li>正在验证任务${task.taskDes}...<font></font></li>`
                        });
                        pro.push(new Promise((resolve) => {
                            this.checkStep(task.id, resolve, status);
                        }));
                    }
                    Promise.all(pro).finally(resolve => {
                        fuc.echoLog({
                            type: 'custom',
                            text: `<li><font class="success">所有任务验证完成，请手动完成人机验证获取key!</font></li>`
                        });
                        //fuc.echoLog({type: 'custom', text: `<li><font class="warning">如果没有显示人机验证，说明有的任务显示成功实际上没完成，请刷新页面查看并手动完成!</font></li>`});
                    });
                } else {
                    this.get_tasks('verify');
                }
            },
            checkStep: function(step, r, status, captcha) {
                if (!captcha) captcha = null;
                if (step !== "captcha") $("#check" + step).replaceWith('<span id="check' + step +
                    '"><i class="fa fa-refresh fa-spin fa-fw"></i> Checking...</span>');
                $.post("/api/check_step", {
                    step: step,
                    id: getURLParameter("id"),
                    "g-recaptcha-response": captcha
                }, function(json) {
                    r(1);
                    if (json.success && step !== "captcha") {
                        $("#check" + step).replaceWith('<span class="text-success" id="check' + step +
                            '"><i class="fa fa-check"></i> Success</span>');
                        status.success();
                    } else if (step !== "captcha") {
                        $("#check" + step).replaceWith('<a id="check' + step + '" href="javascript:checkStep(' + step +
                            ')"><i class="fa fa-question"></i> Check</a>');
                        status.error((json.response ? json.response.error ? json.response.error : 'Error' : 'Error'));
                    }
                    if (json.response) {
                        if (json.response.captcha && json.success) {
                            showAlert("info", json.response.captcha);
                            captchaCheck();
                        } else if (json.response.captcha) {
                            showAlert("warning", json.response.captcha);
                            captchaCheck();
                        }
                        if (json.response.prize) {
                            showAlert("success",
                                'Here is your prize:<h1 role="button" align="middle" style="word-wrap: break-word;">' +
                                json.response.prize + '</h2>');
                        }
                    }
                }).fail(function() {
                    r(1);
                    $("#check" + step).replaceWith('<a id="check' + step + '" href="javascript:checkStep(' + step +
                        ')"><i class="fa fa-question"></i> Check</a>');
                    status.error('Error:0');
                });
            },
            remove: function(remove = false) {
                let pro = [];
                if (remove) {
                    this.updateSteamInfo(() => {
                        if (this.conf.remove.group) {
                            for (let group of fuc.unique(this.taskInfo.groups)) {
                                pro.push(new Promise((resolve) => {
                                    fuc.leaveSteamGroup(resolve, group);
                                }));
                            }
                        }
                        if (this.conf.remove.curator) {
                            for (let curator of fuc.unique(this.taskInfo.curators)) {
                                pro.push(new Promise((resolve) => {
                                    fuc.unfollowCurator(resolve, curator);
                                }));
                            }
                        }
                        Promise.all(pro).finally(data => {
                            fuc.echoLog({
                                type: 'custom',
                                text: `<li><font class="success">所有任务已完成！</font></li>`
                            });
                        });
                    });
                } else {
                    this.get_tasks('remove');
                }
            },
            get_giveawayId: function() {
                let id = location.search.match(/id=([\d]+)/);
                if (id) {
                    return id[1];
                } else {
                    return location.href;
                }
            },
            updateSteamInfo: function(callback) {
                new Promise(resolve => {
                    if (this.taskInfo.groups.length > 0) {
                        if (this.taskInfo.curators.length > 0) {
                            fuc.updateSteamInfo(resolve, "all");
                        } else {
                            fuc.updateSteamInfo(resolve, "community");
                        }
                    } else if (this.taskInfo.curators.length > 0) {
                        fuc.updateSteamInfo(resolve, "store");
                    } else {
                        resolve(1);
                    }
                }).then(s => {
                    if (s === 1) {
                        callback();
                    }
                });
            },
            checkLogin: function() {},
            checkLeft: function(ui) {
                let left = $("#header").text().match(/([\d]+).*?prize.*?left/);
                if (!(left.length > 0 && left[1] !== "0")) {
                    ui.$confirm('此页面已经没有剩余key了, 是否关闭?', '提示', {
                        confirmButtonText: '确定',
                        cancelButtonText: '取消',
                        type: 'warning',
                        center: true
                    }).then(() => {
                        window.close();
                    });
                }
            },
            groups: [], //任务需要加的组
            curators: [], //任务需要关注的鉴赏家
            taskInfo: {
                groups: [], //所有任务需要加的组
                curators: [], //所有任务需要关注的鉴赏家
            },
            tasks: [], //任务信息
            setting: {
                'fuck': true,
                'verify': true,
                'join': false,
                'remove': true
            },
            conf: GM_getValue('conf') ? ((GM_getValue('conf').prys && GM_getValue('conf').prys.load) ? GM_getValue('conf').prys : (GM_getValue('conf').global || defaultConf)) : defaultConf
        };

        const indiedb = {
            fuck: function() {
                if ($("a.buttonenter:contains(Register to join)").length > 0) fuc.echoLog({
                    type: 'custom',
                    text: `<li><font class="error">请先登录！</font></li>`
                });
                let currentoption = $("a.buttonenter.buttongiveaway");
                if (/join giveaway/gim.test(currentoption.text())) {
                    let status = fuc.echoLog({
                        type: 'custom',
                        text: `<li>正在加入赠key...<font></font></li>`
                    });
                    let do_task = this.do_task;
                    fuc.httpRequest({
                        url: currentoption.attr('href'),
                        method: 'POST',
                        data: 'ajax=t',
                        dataType: 'json',
                        headers: {
                            'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
                            'accept': 'application/json, text/javascript, */*; q=0.01'
                        },
                        onload: function(response) {
                            if (debug) console.log(response);
                            if (response.status === 200 && response.response) {
                                if (response.response.success) {
                                    currentoption.addClass("buttonentered").text("Success - Giveaway joined");
                                    $("#giveawaysjoined").slideDown();
                                    $("#giveawaysrecommend").slideDown();
                                    status.success("Success" + (response.response.text ? (":" + response.response.text) : ""));
                                    do_task();
                                } else {
                                    status.error("Error" + (response.response.text ? (":" + response.response.text) : ""));
                                }
                            } else {
                                status.error("Error:" + (response.statusText || response.status));
                            }
                        }
                    });
                } else if (/success/gim.test($("a.buttonenter.buttongiveaway").text())) {
                    this.do_task();
                } else {
                    fuc.echoLog({
                        type: 'custom',
                        text: `<li><font class="error">请检查是否已加入此赠key!</font></li>`
                    });
                }
            },
            do_task: function() {
                let id = $("script").map(function(i, e) {
                    if (/\$\(document\)/gim.test(e.innerHTML)) {
                        let optionId = e.innerHTML.match(/"\/newsletter\/ajax\/subscribeprofile\/optin\/[\d]+"/gim)[0].match(/[\d]+/)[0];
                        let taskId = e.innerHTML.match(/"\/[\d]+"/gim)[0].match(/[\d]+/)[0];
                        return [taskId, optionId];
                    }
                });
                if (id.length === 2) {
                    let tasks = $("#giveawaysjoined a[class*=promo]");
                    let pro = [];
                    for (let task of tasks) {
                        let promo = $(task);
                        if (!promo.hasClass("buttonentered")) {
                            let status = fuc.echoLog({
                                type: 'custom',
                                text: `<li>正在做任务:${promo.parents("p").text()}...<font></font></li>`
                            });
                            if (/facebookpromo|twitterpromo|visitpromo/gim.test(task.className)) {
                                pro.push(new Promise(resolve => {
                                    $.ajax({
                                        type: "POST",
                                        url: urlPath("/giveaways/ajax/" + (promo.hasClass("facebookpromo") ? "facebookpromo" : (promo.hasClass("twitterpromo") ? "twitterpromo" : "visitpromo")) + "/" + id[0]),
                                        timeout: 60000,
                                        dataType: "json",
                                        data: {
                                            ajax: "t"
                                        },
                                        error: function(response, error, exception) {
                                            if (debug) console.log({
                                                response,
                                                error,
                                                exception
                                            });
                                            status.error("Error:An error has occurred performing the action requested. Please try again shortly.");
                                            resolve(0);
                                        },
                                        success: function(response) {
                                            if (debug) console.log(response);
                                            if (response["success"]) {
                                                status.success("Success:" + response["text"]);
                                                promo.addClass("buttonentered").closest("p").html(promo.closest("p").find("span").html());
                                                resolve(1);
                                            } else {
                                                status.error("Error:" + response["text"]);
                                                resolve(0);
                                            }
                                        }
                                    });
                                }));
                            } else if (promo.hasClass("emailoptinpromo")) {
                                pro.push(new Promise(resolve => {
                                    $.ajax({
                                        type: "POST",
                                        url: urlPath("/newsletter/ajax/subscribeprofile/optin/" + id[1]),
                                        timeout: 60000,
                                        dataType: "json",
                                        data: {
                                            ajax: "t",
                                            emailsystoggle: 4
                                        },
                                        error: function(response, error, exception) {
                                            if (debug) console.log({
                                                response,
                                                error,
                                                exception
                                            });
                                            status.error("Error:An error has occurred performing the action requested. Please try again shortly.");
                                            resolve(0);
                                        },
                                        success: function(response) {
                                            if (debug) console.log(response);
                                            if (response["success"]) {
                                                status.success("Success:" + response["text"]);
                                                promo.toggleClass("buttonentered").closest("p").html(promo.closest("p").find("span").html());
                                                resolve(1);
                                            } else {
                                                status.error("Error:" + response["text"]);
                                                resolve(0);
                                            }
                                        }
                                    });
                                }));
                            } else if (promo.hasClass("watchingpromo")) {
                                pro.push(new Promise(resolve => {
                                    let data = fuc.getUrlQuery(promo.attr("href"));
                                    data.ajax = "t";
                                    $.ajax({
                                        type: "POST",
                                        url: urlPath(promo.attr("href").split(/[?#]/)[0]),
                                        timeout: 60000,
                                        dataType: "json",
                                        data: data,
                                        error: function(response, error, exception) {
                                            if (debug) console.log({
                                                response,
                                                error,
                                                exception
                                            });
                                            status.error("Error:An error has occurred performing the action requested. Please try again shortly.");
                                            resolve(0);
                                        },
                                        success: function(response) {
                                            if (debug) console.log(response);
                                            if (response["success"]) {
                                                status.success("Success:" + response["text"]);
                                                promo.toggleClass("buttonentered").closest("p").html(promo.closest("p").find("span").html());
                                                resolve(1);
                                            } else {
                                                status.error("Error:" + response["text"]);
                                                resolve(0);
                                            }
                                        }
                                    });
                                }));
                            } else if (!/the-challenge-of-adblock/gim.test(promo.attr("href"))) {
                                pro.push(new Promise(resolve => {
                                    $.ajax({
                                        type: "POST",
                                        url: urlPath(promo.attr("href")),
                                        timeout: 60000,
                                        dataType: "json",
                                        data: {
                                            ajax: "t"
                                        },
                                        error: function(response, error, exception) {
                                            if (debug) console.log({
                                                response,
                                                error,
                                                exception
                                            });
                                            status.error("Error:An error has occurred performing the action requested. Please try again shortly.");
                                            resolve(0);
                                        },
                                        success: function(response) {
                                            if (debug) console.log(response);
                                            if (response["success"]) {
                                                status.success("Success:" + response["text"]);
                                                promo.toggleClass("buttonentered").closest("p").html(promo.closest("p").find("span").html());
                                                resolve(1);
                                            } else {
                                                status.error("Error:" + response["text"]);
                                                resolve(0);
                                            }
                                        }
                                    });
                                }));
                            } else {
                                status.error("Error:未知任务类型");
                            }
                        }
                    }
                    Promise.all(pro).finally(() => {
                        fuc.echoLog({
                            type: 'custom',
                            text: `<li><font class="warning">所有任务已完成！</font></li>`
                        });
                    });
                } else {
                    fuc.echoLog({
                        type: 'custom',
                        text: `<li><font class="error">获取任务id失败！</font></li>`
                    });
                }
            },
            verify: function() {},
            remove: function() {},
            checkLogin: function() {
                if ($("a.buttonenter:contains(Register to join)").length > 0) window.open("/members/login", "_self");
            },
            checkLeft: function(ui) {},
            setting: {
                'fuck': true,
                'verify': false,
                'join': false,
                'remove': false
            },
            conf: GM_getValue('conf') ? ((GM_getValue('conf').indiedb && GM_getValue('conf').indiedb.load) ? GM_getValue('conf').indiedb : (GM_getValue('conf').global || defaultConf)) : defaultConf
        };

        const opiumpulses = {
            fuck: function() {
                this.get_tasks('FREE');
            },
            get_tasks: function(type = 'FREE') {
                let items = $(`.giveaways-page-item:contains('${type}'):not(:contains('ENTERED'))`);
                let myPoint = this.myPoints;
                let option = {
                    arr: items,
                    time: 100,
                    i: 0,
                    callback: ({
                        arr,
                        i,
                        end
                    }) => {
                        if (end) {
                            fuc.echoLog({
                                type: 'custom',
                                text: `<li><font class="success">所有抽奖参加完成！</font></li>`
                            });
                        } else {
                            let item = arr[i];
                            let needPoints = $(item).find(".giveaways-page-item-header-points").text().match(/[\d]+/gim);
                            if (type === "points" && needPoints && parseInt(needPoints[0]) > myPoint) {
                                fuc.echoLog({
                                    type: 'custom',
                                    text: `<li><font class="warning">点数不足，任务中止！</font></li>`
                                });
                            } else if (type === "points" && !needPoints) {
                                fuc.echoLog({
                                    type: 'custom',
                                    text: `<li><font class="warning">获取抽奖需要点数失败，任务中止！</font></li>`
                                });
                            } else {
                                let status = fuc.echoLog({
                                    type: 'custom',
                                    text: `<li>正在参加抽奖<a href="${$(item).find("a.giveaways-page-item-img-btn-more").attr("href")}" target="_blank">${$(item).find(".giveaways-page-item-footer-name").text().trim()}</a>...<font></font></li>`
                                });
                                let a = $(item).find("a.giveaways-page-item-img-btn-enter:contains('enter')");
                                if (a.attr("onclick") && a.attr("onclick").includes('checkUser')) {
                                    let giveawayId = a.attr("onclick").match(/[\d]+/);
                                    if (giveawayId) {
                                        checkUser(giveawayId[0]);
                                    }
                                }
                                new Promise(r => {
                                    fuc.httpRequest({
                                        url: a.attr('href'),
                                        method: 'GET',
                                        onload: response => {
                                            if (debug) console.log(response);
                                            if (response.responseText && /You've entered this giveaway/gim.test(response.responseText)) {
                                                status.success();
                                                let points = response.responseText.match(/Points:[\s]*?([\d]+)/);
                                                if (type === "points" && points) {
                                                    if (debug) console.log('剩余点数: ' + points[1]);
                                                    opiumpulses.myPoints = parseInt(points[1]);
                                                }
                                            } else {
                                                status.error('Success:' + (response.status || response.statusText));
                                            }
                                            r(1);
                                        },
                                        status,
                                        r
                                    });
                                }).then(data => {
                                    i++;
                                    option.i = i;
                                    fuc.forOrder(option);
                                });
                            }
                        }
                    },
                    complete: true
                };
                fuc.forOrder(option);
            },
            verify: function() {
                let myPoints = $(".page-header__nav-func-user-nav-items.points-items").text().match(/[\d]+/gim);
                if (myPoints) {
                    this.myPoints = myPoints;
                    this.get_tasks('points');
                } else {
                    fuc.echoLog({
                        type: 'custom',
                        text: `<li><font class="error">获取当前拥有点数失败！</font></li>`
                    });
                }
            },
            remove: function() {},
            checkLogin: function() {},
            checkLeft: function(ui) {},
            myPoints: 0,
            setting: {
                'fuck': true,
                'fuckText': 'Free',
                'fuckTitle': '参加免费抽奖',
                'verify': true,
                'verifyText': 'Point',
                'verifyTitle': '参加点数抽奖',
                'join': false,
                'remove': false
            },
            conf: GM_getValue('conf') ? ((GM_getValue('conf').opiumpulses && GM_getValue('conf').opiumpulses.load) ? GM_getValue('conf').opiumpulses : (GM_getValue('conf').global || defaultConf)) : defaultConf
        };

        const givekey = {
            fuck: function(btnArea) {
                if (!$("#navbarDropdown").text().includes("Русский")) {
                    fuc.echoLog({
                        type: "custom",
                        text: `<li><font class="error">需要将页面语言设置为"Русский"！</font></li>`
                    });
                } else {
                    givekey.wssApp.message = btnArea.$message({
                        message: "正在连接WSS...",
                        duration: 0
                    });
                    $(() => givekey.wssApp.init(btnArea));
                }
            },
            analyze_tasks: function(tasks) {
                let status = fuc.echoLog({
                    type: 'custom',
                    text: `<li>正在处理任务信息（用时取决于Steam任务数量，请耐心等待）...<font></font></li>`
                });
                let pro = [];
                this.groups = [];
                this.wGames = [];
                this.fGames = [];
                this.links = [];
                let taskInfoHistory = GM_getValue('taskInfo[' + location.host + this.get_giveawayId() + ']');
                if (taskInfoHistory && taskInfoHistory !== '{"groups":[],"curators":[],"fGames":[],"wGames":[]}') this.taskInfo = taskInfoHistory;
                for (let id of tasks) {
                    let task = $("#task_" + id);
                    let href = task.attr("href");
                    if (href.includes("vk.com")) {} else if (href.includes("steamcommunity.com/groups")) {
                        this.groups.push(href);
                        this.taskInfo.groups.push(href);
                    } else if (task.text().includes("加入愿望单")) {
                        pro.push(new Promise(r => {
                            new Promise(resolve => {
                                fuc.getFinalUrl(resolve, href);
                            }).then(data => {
                                if (data.result === "success") {
                                    let appId = data.finalUrl.match(/app\/([\d]+)/);
                                    if (appId) {
                                        this.wGames.push(appId[1]);
                                        this.taskInfo.wGames.push(appId[1]);
                                        r(1);
                                    } else {
                                        r(0);
                                    }
                                } else {
                                    r(0);
                                }
                            })
                        }));
                    } else if (href.includes("store.steampowered.com/app")) {
                        this.fGames.push(href);
                        this.taskInfo.fGames.push(href);
                    } else {
                        this.links.push(href);
                    }
                }
                Promise.all(pro).finally(() => {
                    this.groups = fuc.unique(this.groups);
                    this.wGames = fuc.unique(this.wGames);
                    this.fGames = fuc.unique(this.fGames);
                    this.links = fuc.unique(this.links);
                    this.taskInfo.groups = fuc.unique(this.taskInfo.groups);
                    this.taskInfo.fGames = fuc.unique(this.taskInfo.fGames);
                    this.taskInfo.wGames = fuc.unique(this.taskInfo.wGames);
                    if (this.groups.length > 0 || this.fGames.length > 0 || this.links.length > 0 || this.wGames.length > 0) {
                        this.do_task();
                    } else {
                        fuc.echoLog({
                            type: 'custom',
                            text: `<li><font class="warning">没有可以自动完成的任务！</font></li>`
                        });
                    }
                    GM_setValue('taskInfo[' + location.host + this.get_giveawayId() + ']', this.taskInfo);
                    status.success();
                    if (debug) console.log(this);
                });
            },
            get_tasks: function() {
                let taskInfoHistory = GM_getValue('taskInfo[' + location.host + this.get_giveawayId() + ']');
                if (taskInfoHistory && taskInfoHistory !== '{"groups":[],"curators":[],"fGames":[],"wGames":[]}') {
                    this.taskInfo = taskInfoHistory;
                    this.remove(true);
                } else {
                    let pro = [];
                    let status = fuc.echoLog({
                        type: 'custom',
                        text: `<li>正在获取任务信息...<font></font></li>`
                    });

                    let tasksContainer = $("a[id^=task_]");
                    for (let task of tasksContainer) { //遍历任务信息
                        let href = task.attr("href");
                        if (href.includes("vk.com")) {} else if (href.includes("steamcommunity.com/groups/")) {
                            this.taskInfo.groups.push(href.match(/groups\/(.+)/)[1]);
                        } else if ($(task).text().includes("加入愿望单")) {
                            pro.push(new Promise(r => {
                                new Promise(resolve => {
                                    fuc.getFinalUrl(resolve, href);
                                }).then(data => {
                                    if (data.result === "success") {
                                        let appId = data.finalUrl.match(/app\/([\d]+)/);
                                        if (appId) {
                                            this.wGames.push(appId[1]);
                                            this.taskInfo.wGames.push(appId[1]);
                                            r(1);
                                        } else {
                                            r(0);
                                        }
                                    } else {
                                        r(0);
                                    }
                                })
                            }));
                        } else if (href.includes("store.steampowered.com/app/")) {
                            this.taskInfo.fGames.push(href.match(/app\/([\d]+)/)[1]);
                        }
                    }
                    Promise.all(pro).finally(() => {
                        this.taskInfo.groups = fuc.unique(this.taskInfo.groups);
                        this.taskInfo.curators = fuc.unique(this.taskInfo.curators);
                        this.taskInfo.wGames = fuc.unique(this.taskInfo.wGames);
                        GM_setValue('taskInfo[' + location.host + this.get_giveawayId() + ']', this.taskInfo);
                        status.success();
                        if (debug) console.log(this);
                        if (this.taskInfo.groups.length > 0 || this.taskInfo.curators.length > 0 || this.taskInfo.wGames.length > 0) {
                            this.remove(true);
                        } else {
                            fuc.echoLog({
                                type: 'custom',
                                text: `<li><font class="warning">没有可以移除的任务！</font></li>`
                            });
                        }
                    });
                }
            },
            do_task: function() {
                this.updateSteamInfo(() => {
                    let pro = [];
                    let groups = fuc.unique(this.groups);
                    let fGames = fuc.unique(this.fGames);
                    let wGames = fuc.unique(this.wGames);
                    let curators = fuc.unique(this.curators);
                    let links = fuc.unique(this.links);
                    if (this.conf.fuck.group) {
                        for (let group of groups) {
                            pro.push(new Promise((resolve) => {
                                fuc.joinSteamGroup(resolve, group);
                            }));
                        }
                    }
                    if (this.conf.fuck.wishlist) {
                        for (let game of wGames) {
                            pro.push(new Promise(resolve => {
                                fuc.addWishlist(resolve, game);
                            }));
                        }
                    }
                    if (this.conf.fuck.followGame) {
                        for (let game of fGames) {
                            pro.push(new Promise((resolve) => {
                                fuc.followGame(resolve, game);
                            }));
                        }
                    }
                    if (this.conf.fuck.curator) {
                        for (let curator of curators) {
                            pro.push(new Promise((resolve) => {
                                fuc.followCurator(resolve, curator);
                            }));
                        }
                    }
                    if (this.conf.fuck.visit) {
                        for (let link of links) {
                            pro.push(new Promise((resolve) => {
                                fuc.visitLink(resolve, link);
                            }));
                        }
                    }
                    Promise.all(pro).finally(resolve => {
                        fuc.echoLog({
                            type: 'custom',
                            text: `<li><font class="success">所有任务已完成！</font></li>`
                        });
                    });
                })
            },
            verify: function() {
                givekey.wssApp.status = fuc.echoLog({
                    type: 'custom',
                    text: `<li>正在获取任务完成状态(时间稍长，请耐心等待)...<font></font></li>`
                });
                givekey.wssApp.request('/distribution/check', 'post', {
                    id: location.href.match(/[\d]+/)[0]
                })
            },
            remove: function(remove = false) {
                let pro = [];
                if (remove) {
                    this.updateSteamInfo(() => {
                        if (this.conf.remove.group) {
                            for (let group of fuc.unique(this.taskInfo.groups)) {
                                pro.push(new Promise((resolve) => {
                                    fuc.leaveSteamGroup(resolve, group);
                                }));
                            }
                        }
                        if (this.conf.remove.unfollowGame) {
                            for (let game of fuc.unique(this.taskInfo.fGames)) {
                                pro.push(new Promise((resolve) => {
                                    fuc.unfollowCurator(resolve, game);
                                }));
                            }
                        }
                        if (this.conf.remove.wishlist) {
                            for (let game of fuc.unique(this.taskInfo.wGames)) {
                                pro.push(new Promise((resolve) => {
                                    fuc.removeWishlist(resolve, game);
                                }));
                            }
                        }
                        if (this.conf.remove.curator) {
                            for (let curator of fuc.unique(this.taskInfo.curators)) {
                                pro.push(new Promise((resolve) => {
                                    fuc.unfollowCurator(resolve, curator);
                                }));
                            }
                        }
                        Promise.all(pro).finally(data => {
                            fuc.echoLog({
                                type: 'custom',
                                text: `<li><font class="success">所有任务已完成！</font></li>`
                            });
                        });
                    });
                } else {
                    this.get_tasks('remove');
                }
            },
            creat_app: function() {
                this.wssApp = {
                    status: {},
                    message: {},
                    loading: false,
                    centrifuge: new Centrifuge(/givekey.ru/.test(location.href) ? 'wss://app.givekey.ru/connection/websocket' : 'wss://app.gkey.fun/connection/websocket'),
                    uid: $('meta[name="uid"]').attr("content"),
                    init: function(m) {
                        this.centrifuge.setToken($('meta[name="cent_token"]').attr("content")), this.centrifuge.connect(), this.centrifuge.on("connect", function(e) {
                            if (debug) console.log(`WSS已连接!`);
                            $("#verify-task").removeClass("is-disabled").removeAttr("disabled");
                            givekey.wssApp.message.close();
                            m.$message({
                                message: "WSS连接成功！",
                                type: "success"
                            });
                            for (let a of $('a[id^=task_]')) {
                                $(a).html($(a).html().replace("Посмотреть обзор на игру", "查看游戏评论")
                                    .replace("Подписаться на разработчика", "订阅开发者")
                                    .replace("Подписаться на куратора", "订阅鉴赏家")
                                    .replace("Поставить лайк", "点赞")
                                    .replace("Подписаться на игру", "关注游戏")
                                    .replace(/Subscribe|Подписаться/, "订阅/加组")
                                    .replace("Сделать репост", "转发")
                                    .replace("Добавить в список желаемого", "加入愿望单")
                                    .replace("Сделать обзор на игру", "评论")
                                    .replace("Посетить web-сайт", "访问页面"));
                            }
                        }), this.centrifuge.on("disconnect", function(e) {
                            if (debug) console.log(`WSS连接断开!\n${e.reason}`);
                            $("#verify-task").addClass("is-disabled").attr("disabled", "disabled");
                            givekey.wssApp.message = m.$message({
                                message: "WSS连接断开，正在重连...",
                                type: "warning",
                                duration: 0
                            });
                        });
                        if (this.uid) this.centrifuge.subscribe(`usr#${this.uid}`, (data) => {
                            if (debug) console.log(data);
                            givekey.wssApp.status.success();
                            if (data.data.js) {
                                let taskA = data.data.js.split(";");
                                if (taskA) {
                                    let tasks = [];
                                    taskA.map((e) => {
                                        if (e.includes("btn-danger")) tasks.push(e.match(/[\d]+/)[0]);
                                    });
                                    givekey.analyze_tasks(tasks);
                                }
                            }
                        });
                    },
                    request: (url, type, data, page) => {
                        if (url) {
                            if (data || (data = {}), type || (type = "post"), "get" == type.toLowerCase()) {
                                if (givekey.wssApp.loading)
                                    return;
                                givekey.wssApp.loading = !0
                            }
                            $.ajax({
                                url: url,
                                type: type,
                                data: data,
                                headers: {
                                    "x-csrf-token": $('meta[name="csrf-token"]').attr("content")
                                },
                                success: function(data) {
                                    if (debug) console.log(data);
                                    if (data.msg && !data.msg.data.includes("Проверяем! Пожалуйста подождите")) givekey.wssApp.status.error(data.msg.data.replace("Вы уже участвовали в этой раздаче!", "你已经参与了此赠key!"));
                                },
                                error: function(e) {
                                    if (debug) console.log(e);
                                    switch (e.status) {
                                        case 401:
                                            givekey.wssApp.status.error("您尚未登录！");
                                            break;
                                        case 403:
                                            givekey.wssApp.status.error("访问被拒绝！");
                                            break;
                                        case 404:
                                            givekey.wssApp.status.error("错误，找不到页面！");
                                            break;
                                        case 500:
                                            givekey.wssApp.status.error("服务器错误！");
                                            break;
                                        case 503:
                                            givekey.wssApp.status.error("错误，请刷新页面！");
                                            break;
                                        default:
                                            givekey.wssApp.status.error("Error:" + e.status);
                                            break;
                                    }
                                    givekey.wssApp.loading = !1
                                }
                            })
                        }
                    }
                }
            },
            get_giveawayId: function() {
                let id = location.href.match(/distribution\/([\d]+)/);
                if (id) {
                    return id[1];
                } else {
                    return location.href;
                }
            },
            updateSteamInfo: function(callback) {
                new Promise(resolve => {
                    if (this.taskInfo.groups.length > 0) {
                        if (this.taskInfo.curators.length > 0 || this.taskInfo.fGames.length > 0 || this.taskInfo.wGames.length > 0) {
                            fuc.updateSteamInfo(resolve, "all");
                        } else {
                            fuc.updateSteamInfo(resolve, "community");
                        }
                    } else if (this.taskInfo.curators.length > 0 || this.taskInfo.fGames.length > 0 || this.taskInfo.wGames.length > 0) {
                        fuc.updateSteamInfo(resolve, "store");
                    } else {
                        resolve(1);
                    }
                }).then(s => {
                    if (s === 1) {
                        callback();
                    }
                });
            },
            checkLogin: function() {
                if ($("a[href='/auth']").length > 0) window.open("/auth/vk", "_self");
            },
            checkLeft: function(ui) {
                if ($("#keys_count").text() === "0") {
                    ui.$confirm('此页面已经没有剩余key了, 是否关闭?', '提示', {
                        confirmButtonText: '确定',
                        cancelButtonText: '取消',
                        type: 'warning',
                        center: true
                    }).then(() => {
                        window.close();
                    });
                }
            },
            groups: [], //任务需要加的组
            curators: [], //任务需要关注的鉴赏家
            fGames: [], //任务需要关注的游戏
            wGames: [], //任务需要加愿望单的游戏
            links: [], //需要浏览的页面链接
            taskInfo: {
                groups: [], //所有任务需要加的组
                curators: [], //所有任务需要关注的鉴赏家
                fGames: [], //所有任务需要关注的游戏
                wGames: [], //所有任务需要加愿望单的游戏
            },
            tasks: [], //任务信息
            setting: {
                'fuck': true,
                'fuckText': 'Init',
                'fuckTitle': '请先Init再做任务！',
                'verify': true,
                'verifyText': 'Fuck',
                'verifyTitle': '请先点击Init按钮再点此按钮！',
                'join': false,
                'remove': true
            },
            conf: GM_getValue('conf') ? ((GM_getValue('conf').givekey && GM_getValue('conf').givekey.load) ? GM_getValue('conf').givekey : (GM_getValue('conf').global || defaultConf)) : defaultConf
        };

        const chubkeys = {
            fuck: function() {
                fuc.echoLog({
                    type: 'custom',
                    text: `<li><font class="warning">因为做新版脚本时此网站没有赠key,所以暂时不支持此网站，如果此网站有赠key,请联系作者！</font></li>`
                });
            },
            verify: function() {
                fuc.echoLog({
                    type: 'custom',
                    text: `<li><font class="warning">因为做新版脚本时此网站没有赠key,所以暂时不支持此网站，如果此网站有赠key,请联系作者！</font></li>`
                });
            },
            remove: function() {
                fuc.echoLog({
                    type: 'custom',
                    text: `<li><font class="warning">因为做新版脚本时此网站没有赠key,所以暂时不支持此网站，如果此网站有赠key,请联系作者！</font></li>`
                });
            },
            get_giveawayId: function() {
                let id = location.href.match(/giveaway\/([\d]+)/);
                if (id) {
                    return id[1];
                } else {
                    return location.href;
                }
            },
            checkLogin: function() {
                if ($("a.nav-link[href*=login]").length > 0) window.open("/login", "_self");
            },
            checkLeft: function(ui) {
                if ($("div.card-body h5:contains(There are no more keys left)").length > 0) {
                    ui.$confirm('此页面已经没有剩余key了, 是否关闭?', '提示', {
                        confirmButtonText: '确定',
                        cancelButtonText: '取消',
                        type: 'warning',
                        center: true
                    }).then(() => {
                        window.close();
                    });
                }
            },
            setting: {
                'fuck': true,
                'verify': true,
                'join': false,
                'remove': true
            },
            conf: GM_getValue('conf') ? ((GM_getValue('conf').chubkeys && GM_getValue('conf').chubkeys.load) ? GM_getValue('conf').chubkeys : (GM_getValue('conf').global || defaultConf)) : defaultConf
        };

        const freegamelottery = {
            fuck: function(vue) {
                GM_setValue("lottery", 1);
                if ($("a.registration-button").length > 0) {
                    if (this.conf.fuck.autoLogin) {
                        let userInfo = GM_getValue('conf').lotteryUserInfo;
                        if (userInfo) {
                            let status = fuc.echoLog({
                                type: 'custom',
                                text: `<li>正在登录...<font></font></li>`
                            });
                            fuc.httpRequest({
                                url: "https://freegamelottery.com/user/login",
                                method: "POST",
                                data: `username=${userInfo.username}&password=${userInfo.password}&rememberMe=1`,
                                headers: {
                                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
                                },
                                onload: function(data) {
                                    if (data.status === 200) {
                                        status.success();
                                        window.location.reload(true);
                                    } else {
                                        status.error("Error:" + (data.statusText || data.status));
                                    }
                                },
                                status
                            });
                        } else {
                            vue.$message({
                                type: 'warning',
                                message: "请先登录！"
                            });
                            $("a.registration-button")[0].click();
                            $("button[value=Login]").click(() => {
                                let conf = GM_getValue('conf');
                                conf.lotteryUserInfo = {
                                    username: $("#modal_login").val(),
                                    password: $("#modal_password").val()
                                };
                                GM_setValue("conf", conf);
                            });
                        }
                    } else {
                        vue.$message({
                            type: 'warning',
                            message: "请先登录！"
                        });
                        $("a.registration-button")[0].click();
                    }
                } else {
                    this.draw();
                }
            },
            draw: function() {
                GM_setValue("lottery", 0);
                if (this.conf.fuck.doTask) {
                    let main = fuc.echoLog({
                        type: 'custom',
                        text: `<li>正在Visit MAIN DRAW(如果长时间没反应，请打开控制台查看错误日志)...<font></font></li>`
                    });
                    $.post('/draw/register-visit', {
                            drawId: DashboardApp.draws.main.actual.id
                        })
                        .done(function() {
                            DashboardApp.draws.main.actual.haveVisited = true;
                            main.success();
                            let survey = fuc.echoLog({
                                type: 'custom',
                                text: `<li>正在Visit SURVEY DRAW(如果长时间没反应，请打开控制台查看错误日志)...<font></font></li>`
                            });
                            $.post('/draw/register-visit', {
                                    type: 'survey',
                                    drawId: DashboardApp.draws.survey.actual.id
                                })
                                .done(function() {
                                    DashboardApp.draws.survey.actual.haveVisited = 1;
                                    survey.success();
                                    let video = fuc.echoLog({
                                        type: 'custom',
                                        text: `<li>正在Visit VIDEO DRAW(如果长时间没反应，请打开控制台查看错误日志)...<font></font></li>`
                                    });
                                    $.post('/draw/register-visit', {
                                            drawId: DashboardApp.draws.video.actual.id
                                        })
                                        .done(function() {
                                            DashboardApp.draws.video.actual.haveVisited = true;
                                            video.success();
                                            let stackpot = fuc.echoLog({
                                                type: 'custom',
                                                text: `<li>正在Visit STACKPOT(如果长时间没反应，请打开控制台查看错误日志)...<font></font></li>`
                                            });
                                            $.post('/draw/register-visit', {
                                                    type: 'stackpot',
                                                    drawId: DashboardApp.draws.stackpot.actual.id
                                                })
                                                .done(function() {
                                                    DashboardApp.draws.stackpot.actual.haveVisited = 1;
                                                    stackpot.success();
                                                    fuc.echoLog({
                                                        type: 'custom',
                                                        text: `<li>任务完成，正在刷新页面（如果页面没有自动刷新，请手动刷新查看结果）...<font></font></li>`
                                                    });
                                                    location.href = '/#/draw/stackpot';
                                                    window.location.reload(true);
                                                });
                                        });
                                });
                        });
                }
            },
            verify: function() {},
            remove: function() {},
            checkLogin: function() {},
            checkLeft: function(ui) {},
            setting: {
                'fuck': true,
                'verify': false,
                'join': false,
                'remove': false
            },
            conf: GM_getValue('conf') ? ((GM_getValue('conf').freegamelottery && GM_getValue('conf').freegamelottery.load) ? GM_getValue('conf').freegamelottery : (GM_getValue('conf').global || defaultConf)) : defaultConf
        };

        const gleam = {
            fuck: function() {
                this.get_tasks('do_task');
            },
            get_tasks: function(callback = 'do_task') {
                let taskInfoHistory = GM_getValue('taskInfo[' + location.host + this.get_giveawayId() + ']');
                if (taskInfoHistory && taskInfoHistory !== '{"groups":[]}') this.taskInfo = taskInfoHistory;
                if (callback === 'remove' && taskInfoHistory && taskInfoHistory !== '{"groups":[]}') {
                    this.remove(true);
                } else {
                    this.twitters = [];
                    this.facebooks = [];
                    this.youtubes = [];
                    this.discords = [];
                    this.others = [];
                    this.groups = [];
                    this.links = [];
                    let status = fuc.echoLog({
                        type: 'custom',
                        text: `<li>正在获取任务信息...<font></font></li>`
                    });

                    let tasksContainer = $('div.entry-content .entry-method');
                    for (let task of tasksContainer) { //遍历任务信息
                        if ($(task).find("i.fa-question").length > 0) {
                            if ($(task).hasClass("visit")) {
                                this.links.push(task);
                            } else {
                                let icon = $(task).find(".icon-wrapper i");
                                if (icon.hasClass("fa-twitter")) {
                                    this.twitters.push(task);
                                } else if (icon.hasClass("fa-facebook")) {
                                    this.facebooks.push(task);
                                } else if (icon.hasClass("fa-youtube")) {
                                    this.youtubes.push(task);
                                } else if (icon.hasClass("fa-discord")) {
                                    this.discords.push(task);
                                } else if (icon.hasClass("fa-steam") || icon.hasClass("fa-steam-symbol")) {
                                    let title = $(task).find(".entry-method-title");
                                    if (/join.*group/gim.test(title.text())) {
                                        let groupA = $(task).find("a[href*='steamcommunity.com/groups']:first").attr("href");
                                        if (groupA) {
                                            let groupName = groupA.match(/steamcommunity.com\/groups\/([\w\d\-_]*)/)[1];
                                            this.groups.push(groupName);
                                            this.taskInfo.groups.push(groupName);
                                        } else {
                                            fuc.echoLog({
                                                type: "custom",
                                                text: `<li><font class="error">获取Steam组信息失败！</font></li>`
                                            });
                                        }
                                    } else {
                                        this.others.push(task);
                                    }
                                } else {
                                    this.others.push(task);
                                }
                            }
                        } else if (callback === "remove") {
                            let icon = $(task).find(".icon-wrapper i");
                            if (icon.hasClass("fa-steam")) {
                                let title = $(task).find(".entry-method-title");
                                if (/join.*group/gim.test(title.text())) {
                                    let groupA = $(task).find("a[href*='steamcommunity.com/groups']:first").attr("href");
                                    if (groupA) {
                                        let groupName = groupA.match(/steamcommunity.com\/groups\/([\w\d\-_]*)/)[1];
                                        this.taskInfo.groups.push(groupName);
                                    } else {
                                        fuc.echoLog({
                                            type: "custom",
                                            text: `<li><font class="error">获取Steam组信息失败！</font></li>`
                                        });
                                    }
                                }
                            }
                        }
                    }
                    this.groups = fuc.unique(this.groups);
                    this.twitters = fuc.unique(this.twitters);
                    this.facebooks = fuc.unique(this.facebooks);
                    this.youtubes = fuc.unique(this.youtubes);
                    this.discords = fuc.unique(this.discords);
                    this.groups = fuc.unique(this.groups);
                    this.others = fuc.unique(this.others);
                    this.taskInfo.groups = fuc.unique(this.taskInfo.groups);
                    GM_setValue('taskInfo[' + location.host + this.get_giveawayId() + ']', this.taskInfo);
                    status.success();
                    if (debug) console.log(this);
                    if (callback === 'do_task') {
                        this.do_task();
                    } else if (callback === 'verify') {
                        this.verify(true);
                    } else {
                        JSON.stringify(this.taskInfo) !== '{"groups":[]}' ? this.remove(true) : fuc.echoLog({
                            type: 'custom',
                            text: `<li><font class="warning">没有可以移除的任务！</font></li>`
                        });;
                    }
                }
            },
            do_task: function() {
                this.updateSteamInfo(() => {
                    let pro = [];
                    let groups = fuc.unique(this.groups);
                    let twitters = fuc.unique(this.twitters);
                    let discords = fuc.unique(this.discords);
                    let facebooks = fuc.unique(this.facebooks);
                    let youtubes = fuc.unique(this.youtubes);
                    let others = fuc.unique(this.others);
                    let links = fuc.unique(this.links);
                    let disc_fb_ytb = [...discords, ...facebooks, ...youtubes];
                    if (this.conf.fuck.group && groups.length > 0) {
                        for (let group of groups) {
                            pro.push(new Promise((resolve) => {
                                fuc.joinSteamGroup(resolve, group);
                            }));
                        }
                    }
                    if (globalConf.other.autoOpen) {
                        if (twitters.length > 0) {
                            for (let twitter of twitters) {
                                let title = $(twitter).find(".entry-method-title").text().trim();
                                let status = fuc.echoLog({
                                    type: 'custom',
                                    text: `<li>正在做任务:${title}...<font></font></li>`
                                });
                                let followButton = $(twitter).find("a.twitter-button:contains(Follow)").attr("href");
                                let retweetButton = $(twitter).find("a.twitter-button:contains(Retweet)").attr("href");
                                let button = followButton || retweetButton;
                                if (button) {
                                    window.open(button, "_blank");
                                    status.warning("已打开任务页面");
                                } else {
                                    status.error("获取任务链接失败");
                                }
                            }
                        }
                        if (disc_fb_ytb.length > 0) {
                            for (let task of disc_fb_ytb) {
                                let title = $(task).find(".entry-method-title").text().trim();
                                let status = fuc.echoLog({
                                    type: 'custom',
                                    text: `<li>正在做任务:${title}...<font></font></li>`
                                });
                                let button = $(task).find("a.btn-info:first").attr("href");
                                if (button) {
                                    window.open(button, "_blank");
                                    status.warning("已打开任务页面");
                                } else {
                                    status.error("获取任务链接失败");
                                }
                            }
                        }
                    }
                    if ((globalConf.other.autoOpen || this.conf.fuck.visit) && links.length > 0) {
                        pro.push(new Promise((resolve) => {
                            this.visit_link(links, 0, resolve);
                        }));
                    }
                    for (let other of others) {
                        let icon = $(other).find(".icon-wrapper i");
                        if (icon.hasClass("fa-steam")) {
                            let title = $(other).find(".entry-method-title").text().trim();
                            fuc.echoLog({
                                type: 'custom',
                                text: `<li><font class="warning">未知任务类型:${title}</font></li>`
                            });
                        } else {
                            let taskType = icon.attr("class").match(/fa-([\w]+)/) ? icon.attr("class").match(/fa-([\w]+)/)[1] : icon.attr("class");
                            fuc.echoLog({
                                type: 'custom',
                                text: `<li><font class="warning">未知任务类型:${taskType}</font></li>`
                            });
                        }
                    }
                    Promise.all(pro).finally(resolve => {
                        fuc.echoLog({
                            type: 'custom',
                            text: `<li><font class="success">所有任务已完成！</font></li>`
                        });
                        if (this.conf.fuck.verify) this.verify(0);
                    });
                })
            },
            verify: function(i = 0) {
                if ($(".ng-scope[ng-include*=challenge]").is(":visible")) {
                    fuc.echoLog({
                        type: "custom",
                        text: `<li><font class="error">触发人机验证，请完成验证后再点击"Verify"按钮验证任务！</font></li>`
                    });
                    return 0;
                }
                let tasks = $('div.entry-content .entry-method');
                if (i < tasks.length) {
                    if (tasks.eq(i).find("i.fa-question").length > 0) {
                        let title = tasks.eq(i).find(".entry-method-title").text().trim();
                        let status = fuc.echoLog({
                            type: "custom",
                            text: `<li>正在验证任务:${title}...<font></font></li>`
                        });
                        tasks.eq(i).find("a.enter-link")[0].click();
                        let enterBtn = tasks.eq(i).find(".form-actions.center .btn-primary:contains(Continue)").removeAttr("disabled");
                        if (enterBtn.length > 0) {
                            setTimeout(() => {
                                enterBtn[0].click();
                                status.warning("Complete");
                                setTimeout(() => {
                                    gleam.verify(++i)
                                }, 1000);
                            }, 1000);
                        } else {
                            setTimeout(() => {
                                gleam.verify(++i)
                            }, 1000);
                        }
                    } else {
                        this.verify(++i);
                    }
                } else {
                    fuc.echoLog({
                        type: 'custom',
                        text: `<li><font class="success">所有任务已完成，</font><font class="warning">没完成的任务请手动完成！</font></li>`
                    });
                }
            },
            remove: function(remove = false) {
                let pro = [];
                if (remove) {
                    this.updateSteamInfo(() => {
                        if (this.conf.remove.group) {
                            for (let group of fuc.unique(this.taskInfo.groups)) {
                                pro.push(new Promise((resolve) => {
                                    fuc.leaveSteamGroup(resolve, group);
                                }));
                            }
                        }
                        Promise.all(pro).finally(data => {
                            fuc.echoLog({
                                type: 'custom',
                                text: `<li><font class="success">所有任务已完成！</font></li>`
                            });
                        });
                    });
                } else {
                    this.get_tasks('remove');
                }
            },
            visit_link: function(links, i, r) {
                if (i < links.length) {
                    let title = $(links[i]).find(".entry-method-title").text().trim();
                    let status = fuc.echoLog({
                        type: 'custom',
                        text: `<li>正在做任务:${title}...<font></font></li>`
                    });
                    let taskTime = $(links[i]).find('.form-actions.center span:contains(Visit):contains(seconds)').text();
                    if (taskTime) {
                        let taskBtn = $(links[i]).find('a.btn-info');
                        let href = taskBtn.attr("href");
                        taskBtn.removeAttr("href")[0].click();
                        let time = taskTime.match(/[\d]+/);
                        if (time) {
                            GM_openInTab("https://time.hclonely.com/?time=" + time[0], {
                                active: 1,
                                setParent: 1
                            }).onclose = () => {
                                status.warning("Complete");
                                taskBtn.attr("target", "_blank").attr("href", href);
                                gleam.visit_link(links, ++i, r);
                            };
                        } else {
                            GM_openInTab(`javascript:setTimeout(()=>{window.close()},1000)`, {
                                active: 1,
                                setParent: 1
                            }).onclose = () => {
                                status.warning("Complete");
                                taskBtn.attr("target", "_blank").attr("href", href);
                                gleam.visit_link(links, ++i, r);
                            };
                        }
                    } else {
                        status.error("获取浏览时间失败");
                    }
                } else {
                    r(1);
                }
            },
            get_giveawayId: function() {
                let id = location.pathname.replace(/\?.*/, "") || location.href;
                return id;
            },
            updateSteamInfo: function(callback) {
                new Promise(resolve => {
                    if (this.taskInfo.groups.length > 0) {
                        fuc.updateSteamInfo(resolve, "community");
                    } else {
                        resolve(1);
                    }
                }).then(s => {
                    if (s === 1) {
                        callback();
                    }
                });
            },
            checkLogin: function() {},
            checkLeft: function(ui) {
                if ($(".massive-message:contains(ended)").is(":visible")) {
                    ui.$confirm('此页面已经没有剩余key了, 是否关闭?', '提示', {
                        confirmButtonText: '确定',
                        cancelButtonText: '取消',
                        type: 'warning',
                        center: true
                    }).then(() => {
                        window.close();
                    });
                }
            },
            groups: [], //任务需要加的组
            links: [], //需要浏览的页面链接
            twitters: [], //twitter任务
            discords: [], //discord任务
            facebooks: [], //facebook任务
            youtubes: [], //youtube任务
            others: [], //位置类型任务
            taskInfo: {
                groups: [], //所有任务需要加的组
            },
            tasks: [], //任务信息
            setting: {
                'fuck': true,
                'verify': true,
                'join': false,
                'remove': true
            },
            conf: GM_getValue('conf') ? ((GM_getValue('conf').gleam && GM_getValue('conf').gleam.load) ? GM_getValue('conf').gleam : (GM_getValue('conf').global || defaultConf)) : defaultConf
        };

        const spoune = {
            fuck: function() {
                this.get_tasks();
            },
            get_tasks: function() {
                let status = fuc.echoLog({
                    type: 'custom',
                    text: `<li>正在获取任务信息...<font></font></li>`
                });
                let giveawayTasks = $("#GiveawayTasks button");
                for (let task of giveawayTasks) {
                    let taskClick = $(task).attr("onclick");
                    if (taskClick) {
                        let taskId = taskClick.match(/loadTask\(([\d]+)/);
                        if (taskId) {
                            this.tasks.push({
                                id: taskId[1],
                                text: $(task).text()
                            })
                        } else {
                            fuc.echoLog({
                                type: 'custom',
                                text: `<li><font class="error">获取${$(task).text()}任务id失败!</font></li>`
                            });
                        }
                    } else {
                        fuc.echoLog({
                            type: 'custom',
                            text: `<li><font class="error">获取${$(task).text()}任务id失败!</font></li>`
                        });
                    }
                }
                status.warning("Complete");
                if (this.tasks.length > 0) {
                    this.do_task();
                } else {
                    fuc.echoLog({
                        type: 'custom',
                        text: `<li><font class="warning">没有检测到可以自动完成的任务!</font></li>`
                    });
                }

            },
            do_task: function() {
                fuc.forOrder({
                    arr: fuc.unique(this.tasks),
                    i: 0,
                    callback: spoune.verify,
                    complete: true
                });
            },
            verify: function({
                arr,
                i,
                end
            }) {
                if (end) {
                    fuc.echoLog({
                        type: 'custom',
                        text: `<li><font class="success">所有任务已完成</font>，<font class="warning">没完成的请手动完成！</font></li>`
                    });
                } else {
                    let task = arr[i];
                    let status = fuc.echoLog({
                        type: "custom",
                        text: `<li>正在做任务${task.text}...<font></font></li>`
                    });
                    new Promise(resolve => {
                        fuc.httpRequest({
                            url: `/controller.php?taskDetail=${task.id}&show`,
                            method: "get",
                            onload: response => {
                                if (debug) console.log(response);
                                if (response.status === 200) {
                                    let src = response.responseText.match(/src="\.([\w\W]*?)">/);
                                    if (src) {
                                        fuc.httpRequest({
                                            url: src[1],
                                            method: "get",
                                            onload: response => {
                                                if (debug) console.log(response);
                                                if (response.status === 200) {
                                                    let href = response.responseText.match(/href="\.(\/verify[\w\W]*?)"/) || response.responseText.match(/href="\.(\/steamgroup[\w\W]*?)"/);
                                                    if (href) {
                                                        fuc.httpRequest({
                                                            url: "/werbung" + href[1],
                                                            method: "get",
                                                            onload: response => {
                                                                if (debug) console.log(response);
                                                                if (response.status === 200 && /Task.*completed/gim.test(response.responseText)) {
                                                                    status.success();
                                                                    resolve(1);
                                                                } else {
                                                                    let href = response.responseText.match(/href="\.(\/verify[\w\W]*?)"/) || response.responseText.match(/href="\.(\/steamgroup[\w\W]*?)"/);
                                                                    if (href) {
                                                                        fuc.httpRequest({
                                                                            url: "/werbung" + href[1],
                                                                            method: "get",
                                                                            onload: response => {
                                                                                if (debug) console.log(response);
                                                                                if (response.status === 200 && /Task.*completed/gim.test(response.responseText)) {
                                                                                    status.success();
                                                                                } else {
                                                                                    status.error("Error:" + (response.statusText || response.status));
                                                                                }
                                                                                resolve(1);
                                                                            },
                                                                            r: resolve,
                                                                            status
                                                                        });
                                                                    } else {
                                                                        status.error("Error:" + (response.statusText || response.status));
                                                                        resolve(0);
                                                                    }
                                                                }
                                                            },
                                                            r: resolve,
                                                            status
                                                        });
                                                    } else {
                                                        status.error("Error:获取任务链接失败(2)");
                                                        resolve(0);
                                                    }
                                                } else {
                                                    status.error("Error:" + (response.statusText || response.status));
                                                    resolve(0);
                                                }
                                            },
                                            r: resolve,
                                            status
                                        })
                                    } else {
                                        status.error("Error:获取任务链接失败(1)");
                                        resolve(0);
                                    }
                                } else {
                                    status.error("Error:" + (response.statusText || response.status));
                                    resolve(0);
                                }
                            },
                            r: resolve,
                            status
                        });
                    }).finally(() => {
                        fuc.forOrder({
                            arr,
                            i: ++i,
                            callback: spoune.verify,
                            complete: true
                        });
                    });
                }
            },
            remove: function() {},
            checkLogin: function() {},
            checkLeft: function(ui) {
                let checkLeft = setInterval(() => {
                    if ($("#keysAvailable").length > 0) {
                        clearInterval(checkLeft);
                        if ($("#keysAvailable").text() === '0') {
                            ui.$confirm('此页面已经没有剩余key了, 是否关闭?', '提示', {
                                confirmButtonText: '确定',
                                cancelButtonText: '取消',
                                type: 'warning',
                                center: true
                            }).then(() => {
                                window.close();
                            });
                        }
                    }
                }, 500);
            },
            tasks: [], //任务信息
            setting: {
                'fuck': true,
                'verify': false,
                'join': false,
                'remove': false
            },
            conf: GM_getValue('conf') ? ((GM_getValue('conf').spoune && GM_getValue('conf').spoune.load) ? GM_getValue('conf').spoune : (GM_getValue('conf').global || defaultConf)) : defaultConf
        };

        function loadSetting() {
            const eNameToNameJoin = {
                group: '加组',
                curator: '关注鉴赏家',
                developer: '关注开发商',
                publisher: '关注发行商',
                announcement: '点赞通知',
                wishlist: '加愿望单',
                followGame: '关注游戏',
                visit: '访问链接',
                verify: '验证任务',
                autoLogin: '自动登录',
                doTask: '做任务'
            };
            const eNameToNameRemove = {
                group: '退组',
                curator: '取关鉴赏家',
                developer: '取关开发商',
                publisher: '取关发行商',
                wishlist: '移除愿望单',
                unfollowGame: '取关游戏',
            };
            const eNameToNameOther = {
                showLogs: '默认显示日志',
                showDetails: '输出详细日志',
                checkLogin: '登录检测',
                checkLeft: '剩余key检测',
                autoOpen: '自动打开任务页面',
            };
            (function() {
                const fuckOptions = [{
                        name: '加组',
                        eName: 'group',
                        des: "Join XXX steam group"
                    },
                    {
                        name: '关注鉴赏家',
                        eName: 'curator',
                        des: "Follow XXX curator"
                    },
                    {
                        name: '关注开发商',
                        eName: 'developer',
                        des: "Follow XXX developer"
                    },
                    {
                        name: '关注发行商',
                        eName: 'publisher',
                        des: "Follow XXX publisher"
                    },
                    {
                        name: '点赞通知',
                        eName: 'announcement',
                        des: "Like Steam announcement"
                    },
                    {
                        name: '加愿望单',
                        eName: 'wishlist',
                        des: "Add XXX to your wishlist"
                    },
                    {
                        name: '关注游戏',
                        eName: 'followGame',
                        des: "Click \"Follow\" button"
                    },
                    {
                        name: '访问链接',
                        eName: 'visit',
                        des: "Visit XXX page"
                    },
                    {
                        name: '验证任务',
                        eName: 'verify',
                        des: "验证任务"
                    },
                    {
                        name: '自动登录',
                        eName: 'autoLogin',
                        des: "自动登录，第一次需要手动登录（仅适用于freegamelottery网站）"
                    },
                    {
                        name: '做任务',
                        eName: 'doTask',
                        des: '依次做"MAIN DRAW","SURVEY DRAW","VIDEO DRAW","STACKPOT"等任务'
                    }
                ];
                const checkedFucks = (GM_getValue('conf') && GM_getValue('conf').global) ? (() => {
                    let conf = [];
                    for (let eName of Object.keys(GM_getValue('conf').global.fuck)) {
                        conf.push(eNameToNameJoin[eName]);
                    }
                    return conf;
                })() : ['加组', '关注鉴赏家', '关注开发商', '关注发行商', '点赞通知', '加愿望单', '关注游戏', '访问链接', '验证任务', '做任务'];

                const joinOptions = [{
                        name: '加组',
                        eName: 'group',
                        des: "Join XXX steam group"
                    },
                    {
                        name: '关注鉴赏家',
                        eName: 'curator',
                        des: "Follow XXX curator"
                    },
                    {
                        name: '关注开发商',
                        eName: 'developer',
                        des: "Follow XXX developer"
                    },
                    {
                        name: '关注发行商',
                        eName: 'publisher',
                        des: "Follow XXX publisher"
                    },
                    {
                        name: '点赞通知',
                        eName: 'announcement',
                        des: "Like Steam announcement"
                    },
                    {
                        name: '加愿望单',
                        eName: 'wishlist',
                        des: "Add XXX to your wishlist"
                    },
                    {
                        name: '关注游戏',
                        eName: 'followGame',
                        des: "Click \"Follow\" button"
                    },
                    {
                        name: '访问链接',
                        eName: 'visit',
                        des: "Visit XXX page"
                    }
                ];
                const checkedJoins = (GM_getValue('conf') && GM_getValue('conf').global) ? (() => {
                    let conf = [];
                    for (let eName of Object.keys(GM_getValue('conf').global.join)) {
                        conf.push(eNameToNameJoin[eName]);
                    }
                    return conf;
                })() : ['加组', '关注鉴赏家', '关注开发商', '关注发行商', '点赞通知', '加愿望单', '关注游戏', '访问链接'];

                const removeOptions = [{
                        name: '退组',
                        eName: 'group',
                        des: "退出steam组(Group)"
                    },
                    {
                        name: '取关鉴赏家',
                        eName: 'curator',
                        des: "取关steam鉴赏家(Curator)"
                    },
                    {
                        name: '取关开发商',
                        eName: 'developer',
                        des: "取关steam开发商(Developer)"
                    },
                    {
                        name: '取关发行商',
                        eName: 'publisher',
                        des: "取关steam发行商(Publisher)"
                    },
                    {
                        name: '移除愿望单',
                        eName: 'wishlist',
                        des: "将游戏移除愿望单(Wishlist)"
                    },
                    {
                        name: '取关游戏',
                        eName: 'unfollowGame',
                        des: "取关游戏(Followed game)"
                    }
                ];
                const checkedRemoves = (GM_getValue('conf') && GM_getValue('conf').global) ? (() => {
                    let conf = [];
                    for (let eName of Object.keys(GM_getValue('conf').global.remove)) {
                        conf.push(eNameToNameRemove[eName]);
                    }
                    return conf;
                })() : ['退组', '取关鉴赏家', '取关开发商', '取关发行商', '移除愿望单', '取关游戏'];

                const otherOptions = [{
                        name: '登录检测',
                        eName: 'checkLogin',
                        des: "检测是否已登录，没登录则跳转到登录页面"
                    },
                    {
                        name: '剩余key检测',
                        eName: 'checkLeft',
                        des: "检测是否有剩余key，没有剩余key则提醒"
                    },
                    {
                        name: '自动打开任务页面',
                        eName: 'autoOpen',
                        des: "未完成的任务自动打开任务页面手动完成（需要关闭浏览器弹窗拦截）"
                    },
                    {
                        name: '默认显示日志',
                        eName: 'showLogs',
                        des: "默认显示右下角任务日志"
                    },
                    {
                        name: '输出详细日志',
                        eName: 'showDetails',
                        des: "控制台输出详细日志"
                    },
                    {
                        name: '自动检测更新',
                        eName: 'checkUpdate',
                        des: "自动检测更新"
                    },
                ];
                const checkedOthers = (GM_getValue('conf') && GM_getValue('conf').global) ? (() => {
                    let conf = [];
                    for (let eName of Object.keys(GM_getValue('conf').global.other)) {
                        conf.push(eNameToNameOther[eName]);
                    }
                    return conf;
                })() : ['登录检测', '剩余key检测', '默认显示日志'];

                new Vue({
                    el: '#global',
                    data: {
                        header: '全局设置',
                        fuck: {
                            checkAll: fuckOptions.length === checkedFucks.length,
                            checkedFucks: checkedFucks,
                            fucks: fuckOptions,
                            isIndeterminate: fuckOptions.length !== checkedFucks.length,
                        },
                        join: {
                            checkAll: joinOptions.length === checkedJoins.length,
                            checkedJoins: checkedJoins,
                            joins: joinOptions,
                            isIndeterminate: joinOptions.length !== checkedJoins.length,
                        },
                        remove: {
                            checkAll: removeOptions.length === checkedRemoves.length,
                            checkedRemoves: checkedRemoves,
                            removes: removeOptions,
                            isIndeterminate: removeOptions.length !== checkedRemoves.length,
                        },
                        other: {
                            checkAll: otherOptions.length === checkedOthers.length,
                            checkedOthers: checkedOthers,
                            others: otherOptions,
                            isIndeterminate: otherOptions.length !== checkedOthers.length,
                        },
                        openDelay: 100,
                        rowType: "flex",
                        rowAlign: "middle",
                        verify: "1"
                    },
                    methods: {
                        fuckHandleCheckAllChange(val) {
                            this.fuck.checkedFucks = val ? fuckOptions.map(e => e.name) : [];
                            this.fuck.isIndeterminate = false;
                        },
                        handleCheckedFucksChange(value) {
                            let checkedCount = value.length;
                            this.fuck.checkAll = checkedCount === this.fuck.fucks.length;
                            this.fuck.isIndeterminate = checkedCount > 0 && checkedCount < this.fuck.fucks.length;
                        },
                        joinHandleCheckAllChange(val) {
                            this.join.checkedJoins = val ? joinOptions.map(e => e.name) : [];
                            this.join.isIndeterminate = false;
                        },
                        handleCheckedJoinsChange(value) {
                            let checkedCount = value.length;
                            this.join.checkAll = checkedCount === this.join.joins.length;
                            this.join.isIndeterminate = checkedCount > 0 && checkedCount < this.join.joins.length;
                        },
                        removeHandleCheckAllChange(val) {
                            this.remove.checkedRemoves = val ? removeOptions.map(e => e.name) : [];
                            this.remove.isIndeterminate = false;
                        },
                        handleCheckedRemovesChange(value) {
                            let checkedCount = value.length;
                            this.remove.checkAll = checkedCount === this.remove.removes.length;
                            this.remove.isIndeterminate = checkedCount > 0 && checkedCount < this.remove.removes.length;
                        },
                        otherHandleCheckAllChange(val) {
                            this.other.checkedOthers = val ? otherOptions.map(e => e.name) : [];
                            this.other.isIndeterminate = false;
                        },
                        handleCheckedOthersChange(value) {
                            let checkedCount = value.length;
                            this.other.checkAll = checkedCount === this.other.others.length;
                            this.other.isIndeterminate = checkedCount > 0 && checkedCount < this.other.others.length;
                        },
                    }
                });
            })();
            (function() {
                const joinOptions = [{
                        name: '加组',
                        eName: 'group',
                        des: "Join XXX steam group"
                    },
                    {
                        name: '关注鉴赏家',
                        eName: 'curator',
                        des: "Follow XXX curator"
                    },
                    {
                        name: '关注开发商',
                        eName: 'developer',
                        des: "Follow XXX developer"
                    },
                    {
                        name: '关注发行商',
                        eName: 'publisher',
                        des: "Follow XXX publisher"
                    },
                    {
                        name: '点赞通知',
                        eName: 'announcement',
                        des: "Like Steam announcement"
                    },
                    {
                        name: '加愿望单',
                        eName: 'wishlist',
                        des: "Add XXX to your wishlist"
                    },
                    {
                        name: '关注游戏',
                        eName: 'followGame',
                        des: "Click \"Follow\" button"
                    }
                ];
                const checkedJoins = (GM_getValue('conf') && GM_getValue('conf').giveawaysu) ? (() => {
                    let conf = [];
                    for (let eName of Object.keys(GM_getValue('conf').giveawaysu.join)) {
                        conf.push(eNameToNameJoin[eName]);
                    }
                    return conf;
                })() : ['加组', '关注鉴赏家', '关注开发商', '关注发行商', '点赞通知', '加愿望单', '关注游戏'];

                const removeOptions = [{
                        name: '退组',
                        eName: 'group',
                        des: "退出steam组(Group)"
                    },
                    {
                        name: '取关鉴赏家',
                        eName: 'curator',
                        des: "取关steam鉴赏家(Curator)"
                    },
                    {
                        name: '取关开发商',
                        eName: 'developer',
                        des: "取关steam开发商(Developer)"
                    },
                    {
                        name: '取关发行商',
                        eName: 'publisher',
                        des: "取关steam发行商(Publisher)"
                    },
                    {
                        name: '移除愿望单',
                        eName: 'wishlist',
                        des: "将游戏移除愿望单(Wishlist)"
                    },
                    {
                        name: '取关游戏',
                        eName: 'unfollowGame',
                        des: "取关游戏(Followed game)"
                    }
                ];
                const checkedRemoves = (GM_getValue('conf') && GM_getValue('conf').giveawaysu) ? (() => {
                    let conf = [];
                    for (let eName of Object.keys(GM_getValue('conf').giveawaysu.remove)) {
                        conf.push(eNameToNameRemove[eName]);
                    }
                    return conf;
                })() : ['退组', '取关鉴赏家', '取关开发商', '取关发行商', '移除愿望单', '取关游戏'];

                new Vue({
                    el: '#giveawaysu',
                    data: {
                        header: 'giveaway.su网站设置',
                        checked: GM_getValue('conf') ? GM_getValue('conf').giveawaysu ? GM_getValue('conf').giveawaysu.load ? true : false : false : false,
                        remove: {
                            checkAll: removeOptions.length === checkedRemoves.length,
                            checkedRemoves: checkedRemoves,
                            removes: removeOptions,
                            isIndeterminate: removeOptions.length !== checkedRemoves.length,
                        },
                        join: {
                            checkAll: joinOptions.length === checkedJoins.length,
                            checkedJoins: checkedJoins,
                            joins: joinOptions,
                            isIndeterminate: joinOptions.length !== checkedJoins.length,
                        },
                        openDelay: 100,
                        rowType: "flex",
                        rowAlign: "middle",
                        verify: "1"
                    },
                    methods: {
                        removeHandleCheckAllChange(val) {
                            this.remove.checkedRemoves = val ? removeOptions.map(e => e.name) : [];
                            this.remove.isIndeterminate = false;
                        },
                        handleCheckedRemovesChange(value) {
                            let checkedCount = value.length;
                            this.remove.checkAll = checkedCount === this.remove.removes.length;
                            this.remove.isIndeterminate = checkedCount > 0 && checkedCount < this.remove.removes.length;
                        },
                        joinHandleCheckAllChange(val) {
                            this.join.checkedJoins = val ? joinOptions.map(e => e.name) : [];
                            this.join.isIndeterminate = false;
                        },
                        handleCheckedJoinsChange(value) {
                            let checkedCount = value.length;
                            this.join.checkAll = checkedCount === this.join.joins.length;
                            this.join.isIndeterminate = checkedCount > 0 && checkedCount < this.join.joins.length;
                        }
                    }
                });
            })();
            (function() {
                const fuckOptions = [{
                        name: '加组',
                        eName: 'group',
                        des: "Join XXX steam group"
                    },
                    {
                        name: '关注鉴赏家',
                        eName: 'curator',
                        des: "Follow XXX curator"
                    },
                    {
                        name: '关注开发商',
                        eName: 'developer',
                        des: "Follow XXX developer"
                    },
                    {
                        name: '关注发行商',
                        eName: 'publisher',
                        des: "Follow XXX publisher"
                    },
                    {
                        name: '加愿望单',
                        eName: 'wishlist',
                        des: "Add XXX to your wishlist"
                    },
                    {
                        name: '关注游戏',
                        eName: 'followGame',
                        des: "Click \"Follow\" button"
                    },
                    {
                        name: '访问链接',
                        eName: 'visit',
                        des: "Visit XXX page"
                    },
                    {
                        name: '验证任务',
                        eName: 'verify',
                        des: "验证任务"
                    }
                ];
                const checkedFucks = (GM_getValue('conf') && GM_getValue('conf').marvelousga) ? (() => {
                    let conf = [];
                    for (let eName of Object.keys(GM_getValue('conf').marvelousga.fuck)) {
                        conf.push(eNameToNameJoin[eName]);
                    }
                    return conf;
                })() : ['加组', '关注鉴赏家', '关注开发商', '关注发行商', '加愿望单', '关注游戏', '访问链接', '验证任务'];

                const removeOptions = [{
                        name: '退组',
                        eName: 'group',
                        des: "退出steam组(Group)"
                    },
                    {
                        name: '取关鉴赏家',
                        eName: 'curator',
                        des: "取关steam鉴赏家(Curator)"
                    },
                    {
                        name: '取关开发商',
                        eName: 'developer',
                        des: "取关steam开发商(Developer)"
                    },
                    {
                        name: '取关发行商',
                        eName: 'publisher',
                        des: "取关steam发行商(Publisher)"
                    },
                    {
                        name: '移除愿望单',
                        eName: 'wishlist',
                        des: "将游戏移除愿望单(Wishlist)"
                    },
                    {
                        name: '取关游戏',
                        eName: 'unfollowGame',
                        des: "取关游戏(Followed game)"
                    }
                ];
                const checkedRemoves = (GM_getValue('conf') && GM_getValue('conf').marvelousga) ? (() => {
                    let conf = [];
                    for (let eName of Object.keys(GM_getValue('conf').marvelousga.remove)) {
                        conf.push(eNameToNameRemove[eName]);
                    }
                    return conf;
                })() : ['退组', '取关鉴赏家', '取关开发商', '取关发行商', '移除愿望单', '取关游戏'];

                fuc.creatSetting("marvelousga", "marvelousGA & dupedornot", fuckOptions, checkedFucks, removeOptions, checkedRemoves);
            })();
            (function() {
                const fuckOptions = [{
                        name: '加组',
                        eName: 'group',
                        des: "Join XXX steam group"
                    },
                    {
                        name: '关注鉴赏家',
                        eName: 'curator',
                        des: "Follow XXX curator"
                    },
                    {
                        name: '关注开发商',
                        eName: 'developer',
                        des: "Follow XXX developer"
                    },
                    {
                        name: '关注发行商',
                        eName: 'publisher',
                        des: "Follow XXX publisher"
                    },
                    {
                        name: '加愿望单',
                        eName: 'wishlist',
                        des: "Add XXX to your wishlist"
                    },
                    {
                        name: '关注游戏',
                        eName: 'followGame',
                        des: "Click \"Follow\" button"
                    },
                    {
                        name: '访问链接',
                        eName: 'visit',
                        des: "Visit XXX page"
                    },
                    {
                        name: '验证任务',
                        eName: 'verify',
                        des: "验证任务"
                    }
                ];
                const checkedFucks = (GM_getValue('conf') && GM_getValue('conf').banana) ? (() => {
                    let conf = [];
                    for (let eName of Object.keys(GM_getValue('conf').banana.fuck)) {
                        conf.push(eNameToNameJoin[eName]);
                    }
                    return conf;
                })() : ['加组', '关注鉴赏家', '关注开发商', '关注发行商', '加愿望单', '关注游戏', '访问链接', '验证任务'];

                const removeOptions = [{
                        name: '退组',
                        eName: 'group',
                        des: "退出steam组(Group)"
                    },
                    {
                        name: '取关鉴赏家',
                        eName: 'curator',
                        des: "取关steam鉴赏家(Curator)"
                    },
                    {
                        name: '取关开发商',
                        eName: 'developer',
                        des: "取关steam开发商(Developer)"
                    },
                    {
                        name: '取关发行商',
                        eName: 'publisher',
                        des: "取关steam发行商(Publisher)"
                    },
                    {
                        name: '移除愿望单',
                        eName: 'wishlist',
                        des: "将游戏移除愿望单(Wishlist)"
                    },
                    {
                        name: '取关游戏',
                        eName: 'unfollowGame',
                        des: "取关游戏(Followed game)"
                    }
                ];
                const checkedRemoves = (GM_getValue('conf') && GM_getValue('conf').banana) ? (() => {
                    let conf = [];
                    for (let eName of Object.keys(GM_getValue('conf').banana.remove)) {
                        conf.push(eNameToNameRemove[eName]);
                    }
                    return conf;
                })() : ['退组', '取关鉴赏家', '取关开发商', '取关发行商', '移除愿望单', '取关游戏'];

                fuc.creatSetting("banana", "grabfreegame & bananagiveaway", fuckOptions, checkedFucks, removeOptions, checkedRemoves);
            })();
            (function() {
                const fuckOptions = [{
                        name: '加组',
                        eName: 'group',
                        des: "Join XXX steam group"
                    },
                    {
                        name: '访问链接',
                        eName: 'visit',
                        des: "Visit XXX page"
                    },
                    {
                        name: '验证任务',
                        eName: 'verify',
                        des: "验证任务"
                    }
                ];
                const checkedFucks = (GM_getValue('conf') && GM_getValue('conf').gamecode) ? (() => {
                    let conf = [];
                    for (let eName of Object.keys(GM_getValue('conf').gamecode.fuck)) {
                        conf.push(eNameToNameJoin[eName]);
                    }
                    return conf;
                })() : ['加组', '访问链接', '验证任务'];

                const removeOptions = [{
                    name: '退组',
                    eName: 'group',
                    des: "退出steam组(Group)"
                }, ];
                const checkedRemoves = (GM_getValue('conf') && GM_getValue('conf').gamecode) ? (() => {
                    let conf = [];
                    for (let eName of Object.keys(GM_getValue('conf').gamecode.remove)) {
                        conf.push(eNameToNameRemove[eName]);
                    }
                    return conf;
                })() : ['退组'];

                fuc.creatSetting("gamecode", "gamecode.win", fuckOptions, checkedFucks, removeOptions, checkedRemoves);
            })();
            (function() {
                const fuckOptions = [{
                        name: '加组',
                        eName: 'group',
                        des: "Join XXX steam group"
                    },
                    {
                        name: '访问链接',
                        eName: 'visit',
                        des: "Visit XXX page"
                    },
                    {
                        name: '验证任务',
                        eName: 'verify',
                        des: "验证任务"
                    }
                ];
                const checkedFucks = (GM_getValue('conf') && GM_getValue('conf').gamehag) ? (() => {
                    let conf = [];
                    for (let eName of Object.keys(GM_getValue('conf').gamehag.fuck)) {
                        conf.push(eNameToNameJoin[eName]);
                    }
                    return conf;
                })() : ['加组', '访问链接', '验证任务'];

                const removeOptions = [{
                    name: '退组',
                    eName: 'group',
                    des: "退出steam组(Group)"
                }, ];
                const checkedRemoves = (GM_getValue('conf') && GM_getValue('conf').gamehag) ? (() => {
                    let conf = [];
                    for (let eName of Object.keys(GM_getValue('conf').gamehag.remove)) {
                        conf.push(eNameToNameRemove[eName]);
                    }
                    return conf;
                })() : ['退组'];

                fuc.creatSetting("gamehag", "gamehag", fuckOptions, checkedFucks, removeOptions, checkedRemoves);
            })();
            (function() {
                const fuckOptions = [{
                        name: '加组',
                        eName: 'group',
                        des: "Join XXX steam group"
                    },
                    {
                        name: '关注鉴赏家',
                        eName: 'curator',
                        des: "Follow XXX curator"
                    },
                    {
                        name: '验证任务',
                        eName: 'verify',
                        des: "验证任务"
                    }
                ];
                const checkedFucks = (GM_getValue('conf') && GM_getValue('conf').prys) ? (() => {
                    let conf = [];
                    for (let eName of Object.keys(GM_getValue('conf').prys.fuck)) {
                        conf.push(eNameToNameJoin[eName]);
                    }
                    return conf;
                })() : ['加组', '关注鉴赏家', '验证任务'];

                const removeOptions = [{
                        name: '退组',
                        eName: 'group',
                        des: "退出steam组(Group)"
                    },
                    {
                        name: '取关鉴赏家',
                        eName: 'curator',
                        des: "取关steam鉴赏家(Curator)"
                    }
                ];
                const checkedRemoves = (GM_getValue('conf') && GM_getValue('conf').prys) ? (() => {
                    let conf = [];
                    for (let eName of Object.keys(GM_getValue('conf').prys.remove)) {
                        conf.push(eNameToNameRemove[eName]);
                    }
                    return conf;
                })() : ['退组', '取关鉴赏家'];

                fuc.creatSetting("prys", "prys", fuckOptions, checkedFucks, removeOptions, checkedRemoves);
            })();
            (function() {
                const fuckOptions = [{
                        name: '加组',
                        eName: 'group',
                        des: "Join XXX steam group"
                    },
                    {
                        name: '关注鉴赏家',
                        eName: 'curator',
                        des: "Follow XXX curator"
                    },
                    {
                        name: '加愿望单',
                        eName: 'wishlist',
                        des: "Add XXX to your wishlist"
                    },
                    {
                        name: '关注游戏',
                        eName: 'followGame',
                        des: "Click \"Follow\" button"
                    },
                    {
                        name: '访问链接',
                        eName: 'visit',
                        des: "Visit XXX page"
                    }
                ];
                const checkedFucks = (GM_getValue('conf') && GM_getValue('conf').givekey) ? (() => {
                    let conf = [];
                    for (let eName of Object.keys(GM_getValue('conf').givekey.fuck)) {
                        conf.push(eNameToNameJoin[eName]);
                    }
                    return conf;
                })() : ['加组', '关注鉴赏家', '加愿望单', '关注游戏', '访问链接'];

                const removeOptions = [{
                        name: '退组',
                        eName: 'group',
                        des: "退出steam组(Group)"
                    },
                    {
                        name: '取关鉴赏家',
                        eName: 'curator',
                        des: "取关steam鉴赏家(Curator)"
                    },
                    {
                        name: '移除愿望单',
                        eName: 'wishlist',
                        des: "将游戏移除愿望单(Wishlist)"
                    },
                    {
                        name: '取关游戏',
                        eName: 'unfollowGame',
                        des: "取关游戏(Followed game)"
                    }
                ];
                const checkedRemoves = (GM_getValue('conf') && GM_getValue('conf').givekey) ? (() => {
                    let conf = [];
                    for (let eName of Object.keys(GM_getValue('conf').givekey.remove)) {
                        conf.push(eNameToNameRemove[eName]);
                    }
                    return conf;
                })() : ['退组', '取关鉴赏家', '移除愿望单', '取关游戏'];

                fuc.creatSetting("givekey", "gkey.fun", fuckOptions, checkedFucks, removeOptions, checkedRemoves);
            })();
            (function() {
                const fuckOptions = [{
                        name: '加组',
                        eName: 'group',
                        des: "Join XXX steam group"
                    },
                    {
                        name: '访问链接',
                        eName: 'visit',
                        des: "Visit XXX page"
                    },
                    {
                        name: '验证任务',
                        eName: 'verify',
                        des: "验证任务"
                    }
                ];
                const checkedFucks = (GM_getValue('conf') && GM_getValue('conf').gleam) ? (() => {
                    let conf = [];
                    for (let eName of Object.keys(GM_getValue('conf').gleam.fuck)) {
                        conf.push(eNameToNameJoin[eName]);
                    }
                    return conf;
                })() : ['加组', '访问链接', '验证任务'];

                const removeOptions = [{
                    name: '退组',
                    eName: 'group',
                    des: "退出steam组(Group)"
                }];
                const checkedRemoves = (GM_getValue('conf') && GM_getValue('conf').gleam) ? (() => {
                    let conf = [];
                    for (let eName of Object.keys(GM_getValue('conf').gleam.remove)) {
                        conf.push(eNameToNameRemove[eName]);
                    }
                    return conf;
                })() : ['退组'];

                fuc.creatSetting("gleam", "gleam.io", fuckOptions, checkedFucks, removeOptions, checkedRemoves);
            })();
            (function() {
                const fuckOptions = [{
                        name: '自动登录',
                        eName: 'autoLogin',
                        des: "自动登录，第一次需要手动登录"
                    },
                    {
                        name: '做任务',
                        eName: 'doTask',
                        des: '依次做"MAIN DRAW","SURVEY DRAW","VIDEO DRAW","STACKPOT"等任务'
                    }
                ];
                const checkedFucks = (GM_getValue('conf') && GM_getValue('conf').freegamelottery) ? (() => {
                    let conf = [];
                    for (let eName of Object.keys(GM_getValue('conf').freegamelottery.fuck)) {
                        conf.push(eNameToNameJoin[eName]);
                    }
                    return conf;
                })() : ['做任务'];

                new Vue({
                    el: '#freegamelottery',
                    data: {
                        header: 'freegamelottery网站设置',
                        checked: GM_getValue('conf') ? GM_getValue('conf').freegamelottery ? GM_getValue('conf').freegamelottery.load ? true : false : false : false,
                        fuck: {
                            checkAll: fuckOptions.length === checkedFucks.length,
                            checkedFucks: checkedFucks,
                            fucks: fuckOptions,
                            isIndeterminate: fuckOptions.length !== checkedFucks.length,
                        },
                        openDelay: 100,
                        rowType: "flex",
                        rowAlign: "middle",
                        verify: "1"
                    },
                    methods: {
                        fuckHandleCheckAllChange(val) {
                            this.fuck.checkedFucks = val ? fuckOptions.map(e => e.name) : [];
                            this.fuck.isIndeterminate = false;
                        },
                        handleCheckedFucksChange(value) {
                            let checkedCount = value.length;
                            this.fuck.checkAll = checkedCount === this.fuck.fucks.length;
                            this.fuck.isIndeterminate = checkedCount > 0 && checkedCount < this.fuck.fucks.length;
                        }
                    }
                });
            })();

            (function() {
                new Vue({
                    el: '#save',
                    data: {
                        title: "保存设置"
                    },
                    methods: {
                        save() {
                            let conf = fuc.creatConf();
                            GM_setValue('conf', conf);
                            this.$notify({
                                title: '保存成功',
                                type: 'success'
                            });
                        }
                    }
                });
                new Vue({
                    el: '#reset',
                    data: {
                        title: "重置所有设置"
                    },
                    methods: {
                        reset() {
                            this.$confirm('是否重置所有设置?', '提示', {
                                confirmButtonText: '确定',
                                cancelButtonText: '取消',
                                type: 'warning'
                            }).then(() => {
                                GM_deleteValue('conf');
                                if (!GM_getValue('conf')) {
                                    vueUi.$message({
                                        type: 'success',
                                        message: '重置成功!'
                                    });
                                } else {
                                    vueUi.$message({
                                        type: 'error',
                                        message: '重置失败!'
                                    });
                                }
                            }).catch(() => {
                                vueUi.$message({
                                    type: 'info',
                                    message: '已取消重置'
                                });
                            });
                        }
                    }
                });
                let download = new Vue({
                    el: '#download',
                    data: {
                        title: "下载设置文件"
                    },
                    methods: {
                        download() {
                            let msg = vueUi.$message({
                                type: 'info',
                                message: '正在处理设置...'
                            });
                            let conf = fuc.creatConf();
                            let creatFile = new FileReader();
                            creatFile.onload = () => {
                                $(`<a href="${creatFile.result}" download="auto-task.conf.json" target="_self"></a>`)[0].click();
                            };
                            creatFile.onerror = (e) => {
                                if (debug) console.log(e);
                                msg.close();
                                vueUi.$message({
                                    type: 'error',
                                    message: '创建下载链接失败！'
                                });
                            };
                            creatFile.readAsDataURL(new File([JSON.stringify(conf, null, 4)], 'setting.conf.txt'));
                        }
                    }
                });
                new Vue({
                    el: '#upload2',
                    data: {
                        title: "加载设置文件",
                        multiple: false,
                        sfl: false,
                        accept: "json",
                        httpRequest: () => {}
                    },
                    methods: {
                        upload(file) {
                            let msg = vueUi.$message({
                                type: 'info',
                                message: '正在读取设置文件...'
                            });
                            if (window.FileReader) {
                                let reader = new FileReader();
                                reader.onload = () => {
                                    if (debug) console.log(reader.result);
                                    msg.close();
                                    let cMsg = vueUi.$message({
                                        type: 'success',
                                        message: '设置文件读取完成！'
                                    });
                                    try {
                                        GM_setValue("conf", JSON.parse(reader.result));
                                        cMsg.close();
                                        vueUi.$message({
                                            type: 'success',
                                            message: '设置加载完成！'
                                        });
                                        location.reload();
                                    } catch (e) {
                                        cMsg.close();
                                        vueUi.$message({
                                            type: 'error',
                                            message: '设置加载失败！'
                                        });
                                        if (debug) console.log("设置加载失败：", e);
                                    }
                                };
                                reader.onerror = (e) => {
                                    if (debug) console.log(e);
                                    msg.close();
                                    vueUi.$message({
                                        type: 'error',
                                        message: '读取设置文件失败！'
                                    });
                                };
                                reader.readAsText(file);
                            } else {
                                msg.close();
                                vueUi.$message({
                                    type: 'warning',
                                    duration: 5000,
                                    message: '当前浏览器不支持直接读取文件，已触发备用方案！'
                                });
                                this.$msgbox({
                                        title: '请将设置文件里的内容复制到下面！',
                                        type: "info",
                                        showClose: false,
                                        showCancelButton: true,
                                        confirmButtonText: '确定',
                                        cancelButtonText: '取消',
                                        closeOnClickModal: false,
                                        closeOnPressEscape: false,
                                        closeOnHashChange: false,
                                        center: true,
                                        showInput: true,
                                        inputType: "textarea",
                                    })
                                    .then(({
                                        value
                                    }) => {
                                        if (debug) console.log(value);
                                        let cMsg = vueUi.$message({
                                            type: 'info',
                                            message: '正在加载设置...'
                                        });
                                        try {
                                            GM_setValue("conf", JSON.parse(value));
                                            cMsg.close();
                                            vueUi.$message({
                                                type: 'success',
                                                message: '设置加载完成！'
                                            });
                                            location.reload();
                                        } catch (e) {
                                            cMsg.close();
                                            vueUi.$message({
                                                type: 'error',
                                                message: '设置加载失败！'
                                            });
                                            if (debug) console.log("设置加载失败：", e);
                                        }
                                    })
                                    .catch(action => {
                                        vueUi.$message({
                                            type: 'info',
                                            message: '已取消'
                                        })
                                    });
                            }
                            this.$refs.upload.abort(file.name);
                        }
                    }
                });
            })();
        }

        function loadAnnouncement() {
            new Promise(resolve => {
                fuc.httpRequest({
                    url: "https://hclonely.github.io/auto-task/announcement.json",
                    method: "get",
                    dataType: "json",
                    onload: response => {
                        if (response.status === 200 && response.response) {
                            resolve({
                                result: "success",
                                data: response.response
                            });
                        } else {
                            resolve({
                                result: "error",
                                data: response
                            });
                        }
                    },
                    r: resolve
                });
            }).then(data => {
                if (data.result === "success") {
                    let announcements = data.data;
                    announcements.map(e => {
                        e.time = fuc.dateFormat("YYYY-mm-dd HH:MM", new Date(e.time));
                        return e;
                    });
                    new Vue({
                        el: "#app",
                        data: {
                            announcements: announcements
                        }
                    });
                } else {
                    vueUi.$message({
                        type: "error",
                        duration: 0,
                        message: `加载公告失败${data.statusText||"，详情请查看控制台"}！`,
                        showClose: true
                    });
                    console.error(data);
                }
            }).catch(error => {
                vueUi.$message({
                    type: "error",
                    duration: 0,
                    message: `加载公告失败，详情请查看控制台！`,
                    showClose: true
                });
                console.error(error);
            });
        }

        if (window.location.host.includes('hclonely')) {
            if (window.location.pathname.includes('setting')) {
                loadSetting();
            } else if (window.location.pathname.includes('announcement')) {
                loadAnnouncement();
            }
        } else if ((window.location.host.includes('marvelousga') || window.location.host.includes('dupedornot') || window.location.host.includes('gamecode.win')) && (!window.location.pathname.includes('giveaway'))) {
            fuc.newTabBlock();
        } else {
            let website = {};
            if (window.location.host.includes('giveaway.su')) {
                website = giveawaysu;
            } else if (window.location.host.includes('marvelousga') || window.location.host.includes('dupedornot')) {
                fuc.newTabBlock();
                website = marvelousga;
            } else if (window.location.host.includes('grabfreegame') || window.location.host.includes('bananagiveaway')) {
                website = banana;
            } else if (window.location.host.includes('gamecode.win')) {
                fuc.newTabBlock();
                website = gamecode;
            } else if (window.location.host.includes('gamehag')) {
                $("#getkey").removeAttr("disabled");
                $("body").append(`<script>window.bannedCountries = ["en"];window.geo ="en";window.respCaptch="";</script>`);

                website = gamehag;
            } else if (window.location.host.includes('prys.revadike')) {
                website = prys;
            } else if (window.location.host.includes('indiedb')) {
                website = indiedb;
            } else if (window.location.host.includes('opiumpulses')) {
                website = opiumpulses;
            } else if (window.location.host.includes('gkey') || window.location.host.includes('givekey')) {
                website = givekey;
                let init = setInterval(() => {
                    if (Centrifuge) {
                        clearInterval(init);
                        website.creat_app();
                    }
                }, 500);
            } else if (window.location.host.includes('chubkeys') || window.location.host.includes('giveawayhopper')) {
                website = chubkeys;
            } else if (window.location.host.includes('freegamelottery')) {
                website = freegamelottery;
            } else if (window.location.host.includes('gleam.io')) {
                website = gleam;
            } else if (window.location.host.includes('spoune')) {
                website = spoune;
            }

            if (globalConf.other.checkLogin) {
                website.checkLogin();
            }
            if (globalConf.other.checkLeft) {
                website.checkLeft(vueUi);
            }

            $('body').append(`
<div id="fuck-task-app">
  <div v-cloak id="fuck-task-btn">
  <el-button :style="style" @click="toggleThisDiv" :icon="icon" :title="title" :show="show"></el-button>
    <el-button type="primary" v-for="item in buttons" v-if="item.show" @click="item.click" :id="item.id" :title="item.title">{{item.text}}</el-button>
    <el-button type="primary" @click="toggle" :id="drawerBtn.id" :title="drawerBtn.title">{{drawerBtn.text}}</el-button>
  </div>
  <div id="fuck-task-info"></div>
</div>
`);
            let showLogs = globalConf.other ? globalConf.other.showLogs : defaultConf.other.showLogs;

            let btnNum = 1;
            for (let boolean of Object.values(website.setting)) {
                if (boolean === true) btnNum++;
            }

            let btnArea = new Vue({
                el: '#fuck-task-btn',
                data: {
                    icon: "el-icon-arrow-right",
                    title: "收起",
                    show: true,
                    style: `position:absolute;left:-20px;width:20px;border:0px;border-top-right-radius:0px;border-bottom-right-radius:0px;padding:0;height:${btnNum*40}px;opacity:80%;`,
                    buttons: [{
                            id: 'fuck-task',
                            text: website.setting.fuckText || 'FuckTask',
                            title: website.setting.fuckTitle || '一键做任务+验证',
                            show: website.setting.fuck,
                            click: () => {
                                website.fuck(btnArea);
                            }
                        },
                        {
                            id: 'verify-task',
                            text: website.setting.verifyText || 'Verify',
                            title: website.setting.verifyTitle || '一键验证任务',
                            show: website.setting.verify,
                            click: () => {
                                website.verify();
                            }
                        },
                        {
                            id: 'join-task',
                            text: website.setting.joinText || 'Join',
                            title: website.setting.joinDes || '一键加组、关注鉴赏家、关注游戏、添加愿望单...',
                            show: website.setting.join,
                            click: () => {
                                website.join();
                            }
                        },
                        {
                            id: 'remove-task',
                            text: website.setting.removeText || 'Remove',
                            title: website.setting.removeTitle || '一键退组、取关鉴赏家、取关游戏、移除愿望单...',
                            show: website.setting.remove,
                            click: () => {
                                website.remove()
                            }
                        }
                    ],
                    drawerBtn: {
                        id: 'show-logs',
                        text: !showLogs ? 'ShowLogs' : 'HideLogs',
                        title: !showLogs ? '显示执行日志' : '隐藏执行日志',
                        show: !!showLogs
                    },
                },
                methods: {
                    toggleThisDiv() {
                        if (this.show) {
                            this.icon = "el-icon-arrow-left";
                            this.title = "展开";
                            $("#fuck-task-btn").animate({
                                width: '0',
                            });
                        } else {
                            this.icon = "el-icon-arrow-right";
                            this.title = "收起";
                            $("#fuck-task-btn").animate({
                                width: '110',
                            });
                        }
                        this.show = !this.show;
                    },
                    toggle() {
                        if (this.drawerBtn.show) {
                            this.drawerBtn.text = 'ShowLogs';
                            this.drawerBtn.title = '显示执行日志';
                            $(".fuck-task-logs").animate({
                                right: '-100%'
                            }, 'fast');
                        } else {
                            this.drawerBtn.text = 'HideLogs';
                            this.drawerBtn.title = '隐藏执行日志';
                            $(".fuck-task-logs").animate({
                                right: '16px'
                            }, 'fast');
                        }
                        this.drawerBtn.show = !this.drawerBtn.show;
                    }
                }
            });
            let infoArea = new Vue({
                el: '#fuck-task-info',
            }).$notify({
                title: '任务执行日志',
                iconClass: '',
                duration: 0,
                position: 'bottom-right',
                showClose: false,
                customClass: 'fuck-task-logs',
                dangerouslyUseHTMLString: true,
                message: ''
            });
            $(".fuck-task-logs .el-notification__title").before(`
<h2 v-cloak id="extraBtn" class="el-notification__title">
<el-badge is-dot class="item" :hidden="hidden">
  <el-button :icon="icon" :title="title" @click="checkUpdate" circle></el-button>
</el-badge>
<el-badge is-dot class="item" :hidden="settingHidden">
  <el-button icon="el-icon-setting" title="设置" @click="setting" circle></el-button>
</el-badge>
<el-badge is-dot class="item" :hidden="announcementHidden">
  <el-button :icon="announcementIcon" title="查看更新内容" @click="updateText" circle></el-button>
</el-badge>
<el-badge is-dot class="item" :hidden="otherHidden">
  <el-button icon="el-icon-brush" title="清理缓存" @click="clearTemp" circle></el-button>
</el-badge>
<el-badge is-dot class="item" :hidden="otherHidden">
  <el-button icon="el-icon-s-promotion" title="提交建议/BUG" @click="updateBug" circle></el-button>
</el-badge>
</h2>
`);
            let extraBtn = new Vue({
                el: "#extraBtn",
                data: {
                    title: "检查更新",
                    icon: "el-icon-refresh",
                    hidden: true,
                    settingHidden: !!GM_getValue('conf'),
                    otherHidden: true,
                    announcementHidden: true,
                    announcementIcon: "el-icon-document"
                },
                methods: {
                    setting() {
                        window.open("https://hclonely.github.io/auto-task/setting.html", "_blank");
                    },
                    updateText() {
                        fuc.getAnnouncement(this);
                    },
                    updateBug() {
                        window.open("https://github.com/HCLonely/auto-task/issues", "_blank");
                    },
                    checkUpdate() {
                        fuc.checkUpdate(this, true);
                    },
                    clearTemp() {
                        let status = fuc.echoLog({
                            type: 'custom',
                            text: `<li>正在清理缓存...<font></font></li>`
                        });
                        let listValues = GM_listValues();
                        for (let value of listValues) {
                            if (value !== "conf") GM_deleteValue(value);
                        }
                        status.success();
                    }
                }
            });
            if (globalConf.other.checkUpdate) {
                fuc.checkUpdate(extraBtn);
            }

            $('.fuck-task-logs .el-notification__content').show();
            if (!showLogs) {
                $(".fuck-task-logs").animate({
                    right: '-100%',
                    display: '-webkit-box',
                    display: '-ms-flexbox',
                    display: 'flex',
                }, 0);
            }
            if (window.location.host.includes('gkey') || window.location.host.includes('givekey')) {
                $("#verify-task").addClass("is-disabled").attr("disabled", "disabled");
            } else if (window.location.host === 'd.freegamelottery.com' && GM_getValue("lottery") === 1) {
                website.draw();
            }
        }

        GM_registerMenuCommand('脚本说明', () => {
            window.open('https://hclonely.github.io/auto-task/', '_blank')
        });
        GM_registerMenuCommand('更新Steam信息', () => {
            new Promise(resolve => {
                fuc.updateSteamInfo(resolve, "all", true);
            }).then(r => {
                fuc.echoLog({
                    type: 'custom',
                    text: `<li><font class="success">Steam信息更新完成</font></li>`
                });
            });
        });

    } catch (e) {
        setTimeout(() => {
            vueUi.$message({
                type: "error",
                duration: 0,
                message: "脚本执行出错，详细信息请查看控制台(红色背景部分)！",
                showClose: true
            });
        }, 500);
        console.log("%c%s", "color:white;background:red", e.stack);
    }

})();