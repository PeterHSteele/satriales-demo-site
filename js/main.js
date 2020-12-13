/* Navigation */

function Satriales_Navigation(){
  const _=this;
  _.nav=document.getElementsByClassName('main-navigation')[0];
  if (!_.nav) return;
  _.header=document.getElementsByClassName('site-header')[0];
  _.toggle=_.header.getElementsByClassName('menu-toggle')[0];
  _.navlist=_.nav.childNodes[0];

  _.replace=function(el,str){
    el.className=el.className.replace(str,'');
  }

  _.handleToggle=function(){
    if(_.nav.className.indexOf(' toggled')>-1){
      _.replace(_.nav,' toggled');
      _.navlist.style.height=0
    } else{     
      _.nav.className+=' toggled';
      _.navlist.style.height=`${_.navlist.scrollHeight}px`;
    }
  }

  _.addListeners=function(){
    _.toggle.addEventListener('click',_.handleToggle.bind(_))
  }

  _.addListeners();
}

const nav=new Satriales_Navigation();

/* Pics slide in */

function SlideIn(){
    this.panels= document.querySelectorAll('.slidein-panel');
    this.wrappers = document.querySelectorAll('.slidein-wrap');
    this.panelScrollTops=[];
    this.checkScrollPos = true;
    this.animationComplete=new Array(this.wrappers.length).fill(false);
    
    this.handleScroll = function(){
        this.panelScrollTops.forEach((offset,index)=>{
          if ( this.checkScrollPos && !this.animationComplete[index] ){
            if ( window.scrollY + window.innerHeight - 150 > offset ){
                this.animatePanels(index);
            }
            this.checkScrollPos=false;
            window.setTimeout(()=>this.checkScrollPos=true,50);
          }
        })
    }

    this.offset = function(el){
        const {top}=el.getBoundingClientRect();
        const scrollY = window.pageYOffset;
        return top + scrollY;
    }

    this.getOffset = function(){
        const scrollTops = [];
        this.wrappers.forEach( wrapper => scrollTops.push(this.offset(wrapper)));
        this.panelScrollTops=scrollTops;
    }

    this.checkAnimationNeeded=function(){
      this.panelScrollTops.forEach((offset,index)=>{
        if(offset>window.scrollY+window.innerHeight){
          let panels=this.findPanels(this.wrappers[index]);
          panels.forEach(panel=>{
            panel.className=panel.className.replace(' animation-not-needed','')
          });
        }
      })
    }

    this.findPanels=function(wrapper){
      const panels=[]
      const nodes=wrapper.childNodes;
      Array.from(nodes).forEach(node=>{
        if (node.className.indexOf('slidein-panel'>-1)){
          panels.push(node);
        }
      })
      return panels;
    }

    this.animatePanels = function(index){
        const panels=this.findPanels(this.wrappers[index]);
        panels.forEach(panel=>panel.className+=' translated');
        this.animationComplete[index]=true;
    }

    this.listen=function(){
        document.addEventListener('scroll',this.handleScroll.bind(this))
    }

    this.init=function(){
        this.getOffset();
        this.checkAnimationNeeded();
        this.listen();
    }

    this.init();
}

const slide = new SlideIn();

function QuestionCarousel(){
    this.carousel=document.querySelector('.question-container');
    if (!this.carousel){
        return;
    }
    this.inputs=this.carousel.getElementsByTagName('input');
    this.loader=document.querySelector('.loader');
    this.results=document.querySelector('.results');
    this.status=document.querySelector('.status')
    this.questionsAndAnswers={}
    this.submitBtn=document.getElementsByClassName('submit-btn')[0];
    this.screenSize=document.getElementsByTagName('body')[0].clientWidth;
    this.diffBetweenActiveAndHidden = this.screenSize>1260?2:1;
    this.bounceAnimationOn=this.screenSize>750;
    this.questions=document.getElementsByClassName('question-wrap');
    this.forward=document.getElementById('forward');
    this.back=document.getElementById('back');
    this.display=document.querySelector('.number');
    this.active=0;
    this.evensHigh=false;
    this.isMoved=false;
    this.questionBodies={}
    this.hasResult=false;

    this.populateQuestions=function(){
        Array.from(this.questions).forEach((question,index)=>{
            this.questionBodies[index]=question.innerHTML.slice();
        })
    }
    
    this.handleForward=function(){
      if(this.active<this.questions.length-1 && !this.forwardPause){
        this.setActive(this.active+1)
        this.forwardPause=true;
        window.setTimeout(()=>this.forwardPause=false, 500)
      }/*else{
        this.setActive(0);
      }*/
    }
    
    this.handleBack=function(){
      if(this.active>0&&!this.backwardPause){
        this.setActive(this.active-1)
        this.backwardPause=true;
        window.setTimeout(()=>this.backwardPause=false,500);
      }/*else{
        this.setActive(this.questions.length-1);
      }*/
    }
    
    this.changeMovementMarker=function(add){
      if(add){
        this.carousel.className+=' is-moved';
      }else{
        this.carousel.className=this.carousel.className.replace(' is-moved','');
      }
      this.isMoved=!this.isMoved;
    }
    
    this.setActive=function(int){
      let increase = int > this.active || int==0 && this.active+1==this.questions.length;
      
      if( int>0 && !this.isMoved){
        this.changeMovementMarker(true)
      } else if (int==0){
        this.changeMovementMarker(false)
      }
      
      if (increase){
        let collapsed = this.questions[int-this.diffBetweenActiveAndHidden];
        if(collapsed){
          collapsed.className+=" no-width";
          collapsed.getElementsByTagName('fieldset')[0].className+="no-display";
        }
      } else {
        let expanded = this.questions[int-this.diffBetweenActiveAndHidden+1];
        if (expanded){
          expanded.className=expanded.className.replace(' no-width','');
          setTimeout(()=>expanded.getElementsByTagName('fieldset')[0].className='', 500);
        }
      }
      this.active = int;
      
      this.evensHigh=int%2;
      this.changeIsHigh();
    }
    
    this.changeIsHigh=function(){
      if(!this.bounceAnimationOn)return;
      Array.from(this.questions).forEach(question=>{
        if (question.className.indexOf("is-high")<0){
          question.className+=" is-high";
        } else {
          question.className=question.className.replace(" is-high",'');
        }
      })
    }

    this.getInputNames=function(){
        Array.from(this.inputs).forEach(input=>{
            const name=input.getAttribute('name')
            if(Object.keys(this.questionsAndAnswers).indexOf(name)<0){
                this.questionsAndAnswers[name]=null;
            }
        })
    }

    this.checkQuestionnaireComplete=function(){
        const {questionsAndAnswers}=this,
        radioNames = Object.keys(questionsAndAnswers);
        for(let i=0;i<radioNames.length;i++){
            if (!questionsAndAnswers[radioNames[i]]){
                this.updatedCompletedCount();
                return false;
            }
        }
        return true;
    }

    this.updatedCompletedCount=function(count){
      this.display.innerHTML=count;
    }

    this.getCompletedCount=function(){
      let answers=0;
        Object.keys(this.questionsAndAnswers).forEach(question=>{
            if(this.questionsAndAnswers[question]!=null){
              answers++
            }
          });
      return answers;
    }

    this.handleRadioInputChange=function(event){
        const {name,value}=event.target
        this.questionsAndAnswers[name]=value;
        const count = this.getCompletedCount();
        this.updatedCompletedCount(count);
        if ( 5==count ){
          this.submitBtn.removeAttribute('disabled')
        } else if (count){
          this.loader.className=this.loader.className.replace('no-display', '');
        }
    }

    this.getInitStatusMsg=function(){
      return "Waiting for your feedback. <span class='number'>0</span>/5 questions complete...";
    }

    this.handleSubmitClick=function(){
        if(!this.hasResult){
            this.loader.className+=' no-display';
            this.status.className+=' no-display';
            this.results.innerHTML='<p>Our recommendation is:</p><p class="recommendation">brisket!</p><img class="recommendation-image" src="../img/brisket.jpg" />';
            this.results.className+=' show';
            this.submitBtn.innerHTML='Redo!';
            this.hasResult=true;
        } else {
            this.reset();
            this.hasResult=false;
        }  
    }

    this.reset=function(){
        Array.from(this.inputs).forEach(input=>input.checked=false);
        this.status.className=this.status.className.replace(' no-display', '');
        Object.keys(this.questionsAndAnswers).forEach(question=>this.questionsAndAnswers[question]=null);
        this.submitBtn.innerHTML='Get Results!';
        this.submitBtn.setAttribute('disabled',true);
        this.display.innerHTML=0;
        this.results.innerHTML='';
    }

    //this.getInitialResultString=function(){return 'Waiting for your feedback. <span class="number">0</span>/5 questions complete...'}
    
    this.addListeners=function(){
      this.forward.addEventListener('click',this.handleForward.bind(this));
      this.back.addEventListener('click',this.handleBack.bind(this));
      Array.from(this.inputs).forEach(input=>input.addEventListener('change',this.handleRadioInputChange.bind(this)));
      this.submitBtn.addEventListener('click', this.handleSubmitClick.bind(this));
    }
    
    this.init=function(){
      this.getInputNames();
      if (this.getCompletedCount()==5){
        this.submitBtn.removeAttribute('disabled')
      }
      this.populateQuestions();
      this.addListeners();
    }

    this.init();
    
  }
  
  const carousel = new QuestionCarousel();
/*
  function MyMap(){
    this.initMap=function(){
      const uluru = { lat: -25.344, lng: 131.036 };
      // The map, centered at Uluru
      const map = new google.maps.Map(document.getElementById("map"), {
        zoom: 4,
        center: uluru,
      });
      // The marker, positioned at Uluru
      const marker = new google.maps.Marker({
        position: uluru,
        map: map,
      }); 
    }
  }

  const map=new MyMap();
  map.initMap();*/
/*
  function initMap() {
    // The location of Uluru
    const kearny = { lat: 40.75592, lng: -74.155 };
    // The map, centered at Uluru
    const map = new google.maps.Map(document.getElementById("map"), {
      zoom: 13,
      center: kearny,
      mapId:'dd11f4096eb32b6c'
    });
    // The marker, positioned at Uluru
    const marker = new google.maps.Marker({
      position: kearny,
      map: map,
    });
  }
*/