import React from 'react';
import BackButton from './BackButton';

const AboutDeveloper = () => {
    return(
<>
<nav className="navbar row" style={{ backgroundColor: "#055993"}}>
<div className="col-12 col-md-6">
        <div className="navbar-brand">
        <img className="logoimgg" src="/images/logo.png" width="60px" height="60px" alt="Nust"/>
            <div style={{textAlign: "center"}}>
            <h5 className="name" style={{marginRight: "10%", fontSize: "16px"}}>NUST Student Portal</h5>
            </div>
            </div>
            </div>
            </nav>
<div className='fade-in-right'>
        <BackButton />
        <h2 style={{color: "grey"}}>About Developer</h2>
<div class="carrrd">
  <span style={{marginTop: "20px"}}>About Me</span>
  <p class="info">My name is Syed Ali Asghar. And, I am student of BS Artificial Intelligence 2024 Batch at NUST (Balochistan Campus). I love to code. That`s why, I have made this portal for all the students of NUST to download this as a Portal App and see GPA, Results & attendance with ease. Enjoy and remember me in your prayers...</p>
</div>
</div>
</>
    )
}

export default AboutDeveloper