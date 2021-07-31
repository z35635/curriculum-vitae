/*
 * @Description: cubeModule：基于zepto实现滑动旋转
 * @Author: Umay
 * @Date: 2021-06-24 10:13:39
 */
// 处理移动端的滑屏事件时，一定要禁止文档滑动的默认行为
$(document).on('touchstart touchmove touchend', function (ev) {
    ev.preventDefault();
})

/* 魔方模块 */
let cubeModule = (function () {
    let $cubeBox = $('.cubeBox'),
        $cube = $cubeBox.children('.cube');
    // 和PC端相比，手指移动和抬起的前提都是手指按下,不再基于事件委托做事件绑定
    let start = function (ev) {
        let point = ev.changedTouches[0];
        this.startX = point.clientX;
        this.startY = point.clientY;
        this.rotateX = this.rotateX || -30;
        this.rotateY = this.rotateY || 45;
        this.isMove = false;  //根据阈值判断是否移动
    };

    let move = function (ev) {
        let point = ev.changedTouches[0];
        this.changeX = point.clientX - this.startX;
        this.changeY = point.clientY - this.startY;
        if (Math.abs(this.changeX) > 10 || Math.abs(this.changeY) > 10) {
            this.isMove = true;
        }
    };

    // changeX控制Y轴旋转角度，changeX<0，绕Y轴逆时针旋转
    // changeY控制X轴旋转角度，changeY<0，绕X轴顺时针旋转
    let end = function (ev) {
        let point = ev.changedTouches[0],
            $this = $(this);
        if (!this.isMove) return;
        this.rotateY = this.rotateY + this.changeX / 3;
        this.rotateX = this.rotateX - this.changeY / 3;
        $this.css('transform', `scale(.8) rotateX(${this.rotateX}deg) rotateY(${this.rotateY}deg)`);
    };

    return {
        init(isInit = false) {
            $cubeBox.css('display', 'block');
            if (isInit) return;
            $cube.css('transform', 'scale(.8) rotateX(-30deg) rotateY(45deg)')
                .on('touchstart', start)
                .on('touchmove', move)
                .on('touchend', end);
            // 将魔方每一面绑定滑屏的每一页
            $cube.children('li').tap(function (ev) {
                $cubeBox.css('display', 'none');
                swiperModule.init($(this).index() + 1);
            });
        }
    };
})();

/* 滑屏模块 */
let swiperModule = (function () {
    let swiperExample = null,
        $baseInfo = null,
        $swiperBox = $('.swiperBox'),
        $returnBox = $swiperBox.find('.returnBox');

    // 初始化以及每一次切换完成执行
    let pageMove = function () {
        // this:swiperExample
        // new Swiper之后slideList会改变
        $baseInfo = $('.baseInfo');
        let activeIndex = this.activeIndex,
            slides = this.slides;
        // PAGE1时实现3D折叠菜单效果
        if (activeIndex === 1 || activeIndex === 7) {
            // MAKISU的基本配置
            $baseInfo.makisu({
                selector: 'dd',
                overlap: 0.8,  //值越小折叠效果越慢
                speed:0.8,
            });
            $baseInfo.makisu('open');
        } else {
            // 在其他页面时折叠菜单
            $baseInfo.makisu({
                selector: 'dd',
                overlap: 0,
                speed: 0,
            });
            $baseInfo.makisu('close');
        }

        // 给当前页面设置对应ID，增加动画效果
        [].forEach.call(slides, (item, index) => {
            if (index === activeIndex) {
                activeIndex === 0 ? activeIndex = slides.length - 2 : null;
                activeIndex === slides.length - 1 ? activeIndex = 1 : null;
                item.id = 'page' + activeIndex;
                return;
            }
            item.id = null;
        });
    };
    return {
        init(initialIndex = 1) {
            $swiperBox.css('display', 'block');
            if (swiperExample) {
                swiperExample.slideTo(initialIndex, 0);
                return;
            }
            swiperExample = new Swiper('.swiper-container', {
                initialSlide: initialIndex,
                direction: 'horizontal',  // vertical
                loop: true, //SWIPER的循环模式：在初始追加最后一张图片，在末尾追加第一张图片
                effect: 'coverflow', // slide / fade / cube / coverflow / flip
                on: {
                    init: pageMove,
                    transitionEnd: pageMove
                }
            });
            swiperExample.slideTo(initialIndex, 0);  //默认触发transitionEnd回调函数

            // 返回按钮处理
            $returnBox.tap(function (ev) {
                $swiperBox.css('display', 'none');
                cubeModule.init(true);
            });
        }
    }
})();

cubeModule.init();

/* =====音乐的处理===== */
let handleMusic = function () {
    let $musicAudio = $('.musicAudio'),
        musicAudio = $musicAudio[0],
        $musicIcon = $('.musicIcon');

    $musicAudio.on('canplay', function (ev) {
        $musicIcon.css('display', 'block')
    });

    let play = function play() {
        musicAudio.volume = .01;
        musicAudio.play();//初始唤醒播放功能1
        $musicIcon.addClass('move');
        document.removeEventListener("touchstart", play, false); //移除初始的唤醒播放功能2
    };
    play();

    $musicIcon.tap(function (ev) {
        if (musicAudio.paused) {
            play();
            return;
        }
        musicAudio.pause();
        $musicIcon.removeClass('move');
    });

    // 兼容处理，例如iPhone的微信中在准备好之前不允许播放
    document.addEventListener("WeixinJSBridgeReady", play, false);//微信和H5可以正常通信
    document.addEventListener("YixinJSBridgeReady", play, false);
    document.addEventListener("touchstart", play, false); //初始唤醒播放功能2
}

// 设置1s后再载入音乐
setTimeout(handleMusic, 1000);