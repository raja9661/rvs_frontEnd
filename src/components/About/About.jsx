import { useEffect, useRef, useState } from 'react';
import {Link, useLocation } from "react-router-dom";
import Logo from "../../assets/logo.jpeg";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import "../About/About.css";
import axios from 'axios';
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import FadeInOnScroll from './FadeInOnScroll';
import { FaArrowLeft, FaArrowRight } from "react-icons/fa"; // You can use any icons


// Slider arrow code difeined here for next arrow
const NextArrow = (props) => {
  const { className, onClick } = props;
  return (
    <div className={`${className} custom-arrow next`} onClick={onClick}>
      <FaArrowRight />
    </div>
  );
};

// Slider arrow code difeined here for prev arrow
const PrevArrow = (props) => {
  const { className, onClick } = props;
  return (
    <div className={`${className} custom-arrow prev`} onClick={onClick}>
      <FaArrowLeft />
    </div>
  );
};


function About() {
  const contactRef = useRef(null);
  const location = useLocation();




  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowButton(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };





  useEffect(() => {
    if (location.hash === "#Contact" && contactRef.current) {
      const offset = 60; // Adjust for header height
      const top = contactRef.current.getBoundingClientRect().top + window.scrollY - offset;

      window.scrollTo({
        top,
        behavior: "smooth",
      });
    }
  }, [location]);









  const scrollToContact = () => {
    if (contactRef.current) {
      const offset = 60; // Header height
      const top = contactRef.current.getBoundingClientRect().top + window.scrollY - offset;

      window.scrollTo({ top, behavior: 'smooth' });
    }
  };


  const settings = {
    dots: true,
    infinite: true,
    autoplay: true,
    autoplaySpeed:5000, // 5 seconds
    speed: 1000,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: true,
     nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
  };


 
  

  //Form code start from here

  
  
const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    company: "",
    subject: "",
    reason: "",
    message: "",
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const isFormValid = () => {
    return (
      formData.fullName.trim() &&
      formData.email.trim() &&
      /\S+@\S+\.\S+/.test(formData.email) &&
      /^\d{10}$/.test(formData.phone) &&
      formData.message.trim()
    );
  };

  const handleSubmit = async(e) => {
    e.preventDefault();

    if (!isFormValid()) return;

    try {
          const res = await axios.post(
            `${import.meta.env.VITE_Backend_Base_URL}/about/contactus`,
            formData
          );
          toast.success("Form Submitted Successfully. We will get back to you soon. Thanks", {
            position: "bottom-right"  // 👈 This places the toast just above the bottom
          });
          // toast.success(res.data.message);
          // const user = res.data.user;
          // localStorage.setItem("token", res.data.token);
          // localStorage.setItem("role", res.data.user.role);
          // localStorage.setItem("loginUser", JSON.stringify(res.data.user));
    
          // Role-based navigation
          
        } catch (error) {
          console.error("Data not sent:", error);
          
        }

    // You can replace this with an API call
    // console.log("Form submitted:", formData);
    // setSubmitted(true);
    // alert("✅ Your message has been submitted successfully!");

    // Reset form
    setFormData({
      fullName: "",
      email: "",
      phone: "",
      company: "",
      subject: "",
      reason: "",
      message: "",
    });
  };

  return (
    <div>
        <div>
            
            {/* Main containe start from here */}
            <div className='bannerContainer relative h-fit flex justify-center flex-col' style={{backgroundImage:"url(https://rvsdoc1.s3.ap-south-1.amazonaws.com/aboutUs.jpg)", backgroundAttachment:"fixed", backgroundSize:"cover"}}>
                {/* Header start from here */}
                <div className='h-22 w-full text-white flex items-center px-2 md:px-6 justify-between sticky top-0 z-9999' style={{background:"rgba(0,0,0,0.8)"}}>
                    <div className='mt-0'><Link to="/"><img src={Logo} alt="RVS Logo" className="h-12 md:h-18" /></Link></div>
                    <div>
                        <button  onClick={scrollToContact}  className='px-8 cursor-pointer hover:text-blue-500'><i className='fa fa-phone me-1'></i> <span className='hidden md:inline'>Contact us</span></button>
                        <Link to="/" className='p-2 px-3 md:px-6 text-white rounded-full cursor-pointer' style={{backgroundImage:"linear-gradient(to top, #4481eb 0%, #04befe 100%)"}}><i className='fa fa-right-to-bracket me-1'></i> <span className='hidden md:inline'>Login</span></Link>
                    </div>
                </div>
                <div className='aboutContainer p-0 md:p-6 pb-0'>
                  <div className="grid grid-cols-1 md:grid-cols-6 md:gap-4">
                    <section className="introSection md:col-span-4">
                      <Slider {...settings}>
                        <div>
                          <div className='flex flex-col justify-center items-center py-2 md:py-8 md:h-[450px]' style={{width:"100%", position:"relative", overflow:"hidden"}}>
                            <img src="https://rvsdoc1.s3.ap-south-1.amazonaws.com/banner-1.jpg" />
                            <div className='absolute w-full h-full bg-black opacity-70'></div>
                            <div className='absolute z-10 px-16 md:px-22'>
                              <p className="font-semibold_ text-sm md:text-2xl mt-2 text-white">
                                Reliable Verification Services (RVS) combines a multidisciplinary
                                approach with deep industry knowledge to help clients meet
                                challenges and seize opportunities.
                              </p>
                              <button onClick={scrollToContact} className='z-10 mt-4 md:mt-12 p-2 md:p-4 px-4 md:px-8 bg-white cursor-pointer font-semibold text-white rounded-full' style={{backgroundImage: "linear-gradient(to right, #b8cbb8 0%, #b8cbb8 0%, #b465da 0%, #cf6cc9 33%, #ee609c 66%, #ee609c 100%)"}}>Contact us</button>
                            </div>
                          </div>
                        </div>
                        <div>
                          <div className='flex flex-col justify-center items-center py-8 md:h-[450px]' style={{width:"100%", position:"relative", overflow:"hidden"}}>
                            <img src="https://rvsdoc1.s3.ap-south-1.amazonaws.com/banner-2.jpg" />
                            <div className='absolute w-full h-full bg-black opacity-70'></div>
                            <div className='absolute z-10 px-16 md:px-22'>
                              <p className="font-bold_ text-sm md:text-2xl mt-2 text-white">
                                RVS provides operational solutions for banks and financial
                                institutions across India. With over a decade of expertise in
                                identifying and preventing financial fraud, we customize solutions
                                to suit each client's requirements.
                              </p>
                              <button onClick={scrollToContact} className='z-10 mt-4 md:mt-12 p-2 md:p-4 px-4 md:px-8 bg-white cursor-pointer text-white rounded-full' style={{backgroundImage: "linear-gradient(to right, #b8cbb8 0%, #b8cbb8 0%, #b465da 0%, #cf6cc9 33%, #ee609c 66%, #ee609c 100%)"}}>Contact us</button>
                            </div>
                          </div>
                        </div>
                        <div>
                          <div>
                            <div className='flex flex-col justify-center items-center py-8 md:h-[450px]' style={{width:"100%", position:"relative", overflow:"hidden"}}>
                              <img src="https://rvsdoc1.s3.ap-south-1.amazonaws.com/bg-img.jpg" />
                              <div className='absolute w-full h-full bg-black opacity-70'></div>
                                <div className='absolute left-0 z-10 px-16 md:px-22'>
                                  <h3 className='text-white text-3xl mb-3'>Why us</h3>
                                  <ul className="mt-1 text-white text-sm md:text-2xl">
                                    <li className='mb-2'>
                                      <span className="me-8">
                                        <i className="fa fa-square-check text-white me-1"></i> Skilled and
                                        trained experts
                                      </span>
                                      </li>
                                      <li className='mb-2'>
                                      <span className="me-8">
                                        <i className="fa fa-square-check text-white me-1"></i> Client
                                        identity protection
                                      </span>
                                      </li>
                                      <li className='mb-2'>
                                      <span className="me-8">
                                        <i className="fa fa-square-check text-white me-1"></i> Timely
                                        service delivery
                                      </span>
                                    </li>
                                  </ul>
                                  <button onClick={scrollToContact} className='z-10 mt-4 md:mt-12 p-2 md:p-4 px-4 md:px-8 bg-white cursor-pointer text-white rounded-full' style={{backgroundImage: "linear-gradient(to right, #b8cbb8 0%, #b8cbb8 0%, #b465da 0%, #cf6cc9 33%, #ee609c 66%, #ee609c 100%)"}}>Contact us</button>
                                 
                                </div>
                            </div>
                          </div>
                        </div>
                      </Slider>
                    </section>

                    <section className='grid col-span-2 place-items-center bannerRightContainer'>
                      <div className='grid grid-cols-2 gap-4 p-4 relative z-10'>
                        <div className='box-1 p-6 py-6'>
                          <div className='flex flex-col text-center items-center gap-2'>
                            <i className='fa fa-file-alt iconItem'></i>
                            <h3 className='font-bold text-lg'>Application Processing</h3>
                          </div>
                        </div>
                        <div className='box-2 p-6 py-6'>
                            <div className='flex flex-col text-center items-center gap-2'>
                              <i className='fa fa-check-circle iconItem'></i>
                              <h3 className='font-bold text-lg'>Document Validation</h3>
                            </div>
                        </div>
                        <div className='box-3 p-6 py-6'>
                        <div className='flex flex-col text-center items-center gap-2'>
                          <i className='fa fa-id-badge iconItem'></i>
                          <h3 className='font-bold text-lg'>Employee / Vendor Profiling</h3>
                        </div>
                      </div>
                      <div className='box-4 p-6 py-6'>
                        <div className='flex flex-col text-center items-center gap-2'>
                          <i className='fa fa-seedling iconItem'></i>
                          <h3 className='font-bold text-lg'>Seeding</h3>
                        </div>
                      </div>
                      </div>
                      {/* <div className='box-1 flex justify-start flex-col p-6 py-8'>
                        <div className='flex items-center gap-4 mb-3'>
                          <i className='fa fa-file-alt iconItem'></i>
                          <h3 className='font-bold text-lg'>Application Processing</h3>
                        </div>
                        <p className=''>We assist banks and NBFCs in meeting application processing demands using simple and cost-effective solutions tailored for individual organizations.</p>
                      </div>
                      <div className='box-2 flex justify-start flex-col p-6 py-8'>
                        <div className='flex items-center gap-4 mb-3'>
                          <i className='fa  fa-check-circle iconItem'></i>
                          <h3 className='font-bold text-lg'>Document Validation</h3>
                        </div>
                        <p>We verify the authenticity of documents submitted by applicants to prevent infiltration into the credit approval process. Our decade-long experience helps identify and filter fake documents.</p>
                      </div> 
                      <div>*/}
                      {/* <div className='box-3 flex justify-start flex-col p-6 py-8'>
                        <div className='flex items-center gap-4 mb-3'>
                          <i className='fa fa-id-badge iconItem'></i>
                          <h3 className='font-bold text-lg'>Employee / Vendor Profiling</h3>
                        </div>
                        <p>RVS helps reduce people-risk by offering employment background screening services. We detect inaccuracies such as exaggerated job titles or fictitious employers through direct verification with past employers.</p>
                      </div>
                      <div className='box-4 flex justify-start flex-col p-6 py-8'>
                        <div className='flex items-center gap-4 mb-3'>
                          <i className='fa fa-seedling iconItem'></i>
                          <h3 className='font-bold text-lg'>Seeding</h3>
                        </div>
                        <p>Seeding ensures that sales personnel follow proper protocols. We conduct both telephonic and physical seeding.</p>
                      </div>
                      </div> */}
                    </section>
                    </div>
                    <section className='grid grid-cols-1 md:grid-cols-3 mt-10 mb-10'>
                      <div className='px-6 py-8' style={{backgroundColor:"#e3f0ff"}}>
                        <FadeInOnScroll direction="left" delay={600}>
                          <h2 className='font-bold text-lg mb-1'>Our Services</h2>
                          <p className='mb-4'>We provide a broad range of investigation and detection services including corporate, special, personal, and employee investigations—ensuring timely and reliable reports.</p>
                          <h3 className='font-semibold mt-3'><i className='fa fa-check-square me-1'></i> Sampling Process - Banking & Financial Sector</h3>
                          <p className='hidden'>Specialized support for financial institutions through structured verification and sampling protocols.</p>

                          <h3 className='font-semibold mt-3'><i className='fa fa-check-square me-1'></i> Application Review & Processing</h3>
                          {/* Identification, photocopying, and secure handling of flagged or potentially suspicious applications. */}

                          <h3 className='font-semibold mt-3'><i className='fa fa-check-square me-1'></i> Field Verification</h3>
                          {/* On-site visits to applicant-provided addresses for physical verification and background checks. */}

                          <h3 className='font-semibold mt-3'><i className='fa fa-check-square me-1'></i> Discreet Checks & Document Validation</h3>
                          {/* Confidential verification of submitted documents and background data to ensure authenticity. */}

                          <h3 className='font-semibold mt-3'><i className='fa fa-check-square me-1'></i> Report Preparation & Submission</h3>
                          {/* Detailed findings compiled and submitted in the bank's prescribed format for seamless integration. */}

                          <h3 className='font-semibold mt-3'><i className='fa fa-check-square me-1'></i> Regular MIS Reporting</h3>
                          {/* Periodic Management Information System (MIS) reports shared with stakeholders for transparency and performance tracking. */}

                          <h3 className='font-semibold mt-3'><i className='fa fa-check-square me-1'></i> Credit Appraisal & Risk Assessment</h3>
                          {/* We help credit and risk teams detect and prevent financial fraud using effective tools, regularly updating our methods to stay ahead. */}
                        </FadeInOnScroll>
                          
                      </div>
                      <div className='pb-4 px-6 md:px-0 md:py-8' style={{backgroundColor:"#e3f0ff"}}>
                        <FadeInOnScroll direction="down" delay={800}>
                          <h3 className='font-bold text-lg mb-3'>Our Strengths</h3>
                            <ul className='mt-1'>
                              <li className='mb-2'><i className='fa fa-circle-check me-1'></i> Experienced investigative professionals</li>
                              <li className='mb-2'><i className='fa fa-circle-check me-1'></i> Advanced equipment</li>
                              <li className='mb-2'><i className='fa fa-circle-check me-1'></i> Ongoing training programs</li>
                              <li className='mb-2'><i className='fa fa-circle-check me-1'></i> Confidential client identity</li>
                              <li className='mb-2'><i className='fa fa-circle-check me-1'></i> Timely and precise service delivery</li>
                            </ul>
                          </FadeInOnScroll>
                      </div>
                      <div className='px-6 py-8 text-white' style={{backgroundColor:"rgb(0, 0, 0, 30%)"}}>
                        <FadeInOnScroll direction="right" delay={1000}>
                          <h2 className='font-bold text-lg mb-1'>Infrastructure Highlights</h2>
                          <h3 className='font-semibold mt-3'><i className='fa fa-check-square me-1'></i> Dedicated Office Space</h3>
                          <p className='hidden'>Secure and functional premises with approximately 30 sq. ft. allocated per workstation.</p>

                          <h3 className='font-semibold mt-3'><i className='fa fa-check-square me-1'></i> Modern Communication Tools</h3>
                          {/* Mobile devices provided for on-the-go supervision and efficient team coordination. */}

                          <h3 className='font-semibold mt-3'><i className='fa fa-check-square me-1'></i> High-Speed Connectivity & Advanced IT Systems</h3>
                          {/* Reliable high-speed internet, supported by modern computers tailored for operational efficiency. */}

                          <h3 className='font-semibold mt-3'><i className='fa fa-check-square me-1'></i> Comprehensive Office Equipment</h3>
                          {/* Fully equipped with printers, scanners, and copiers to support seamless document handling. */}

                          <h3 className='font-semibold mt-3'><i className='fa fa-check-square me-1'></i> Independent Executive Workstations</h3>
                          {/* Ergonomically designed individual workstations to promote productivity and focus. */}

                          <h3 className='font-semibold mt-3'><i className='fa fa-check-square me-1'></i> 24/7 Surveillance</h3>
                          {/* CCTV-enabled office monitoring to ensure safety and operational transparency. */}
                        
                             </FadeInOnScroll>
                      </div>
                    </section>
                  {/* <section className='mt-20'>
                    <h3>Our Team</h3>
                    <p>
                      Our skilled and experienced investigators use the latest technology to ensure quick and accurate results.
                    </p>
                  </section> */}
                </div>
                

                          

                    <section className='grid grid-cols-1 md:grid-cols-2 ps-12 text-white p-8 w-full' style={{backgroundColor:"rgba(0,0,0,0.5)", backgroundImage:`url("https://rvsdoc1.s3.ap-south-1.amazonaws.com/aboutUs-11.jpg")`, backgroundSize:"cover", backgroundAttachment:"fixed"}}>
                        
                        
                        <div className='mb-8'>
                          <FadeInOnScroll direction="left" delay={800}>
                            <h2 className='font-bold text-lg mb-3'>Documents We Verify</h2>
                          <h3 className='font-semibold mt-2 mb-1'>Bank Statements</h3>
                              <ul className='list-disc ps-7'>
                                <li>Nationalized Banks: SBI, PNB, Indian Bank, UCO Bank, and others</li>

                                <li>Private Sector Banks: HDFC, ICICI, Axis, IDBI, Citibank, and more</li>

                                {/* <li>Original PDF Bank Statements from 20+ Indian banks supported</li> */}
                              </ul>
                              <h3 className='font-semibold mt-4 mb-1'>Utility Bills</h3>
                              <ul className='list-disc ps-7'>
                                <li>Telecom Bills from <span className='font-semibold'>Airtel</span>, <span className='font-semibold'>Jio</span>, <span className='font-semibold'>Vodafone</span>, and others</li>
                              </ul>

                              <h3 className='font-semibold mt-8 mb-1'>ITO</h3>
                                  <ul className='list-disc ps-7'>
                                    <li>Income Tax Returns (ITR)</li>
                                    <li>Form 26AS</li>
                                    <li>Annual Information Statement (AIS)</li>
                                    <li>GSTR 1, GSRT 3B</li>
                                  </ul>
                                
                                 <h3 className='font-semibold mt-4 mb-1'>KYC Documents</h3>
                                  <ul className='list-disc ps-7'>
                                    <li>PAN Card, Aadhaar Card, Passport, Driving License, RC</li>
                                  </ul>
                            
                          </FadeInOnScroll>
                        </div>
                        <div className='pb-8'>
                          <FadeInOnScroll direction="right" delay={800}>
                            <h2 className='font-bold text-lg mb-3'>Additional Verifications</h2>
                              <ul className='mt-2 list-disc ps-7'>
                                <li className='mb-2'>Bank Account Verification via PAN</li>
                                <li className='mb-2'>Aadhaar-based Verification (Photo + Demographics | PAN India)</li>
                                <li className='mb-2'>Passport-based Demographic Validation</li>
                                <li className='mb-2'>Alternate Mobile Number Detection via Linked Records</li>
                                <li className='mb-2'>Employment History Tracing using Form 26AS</li>
                                <li className='mb-2'>Financial Profile Assessment via PAN-linked records</li>
                              </ul>
                            </FadeInOnScroll>
                        </div>
                    </section>
                    <div ref={contactRef} className='grid grid-cols-1 md:grid-cols-2' id='Contact'>
                        <div className='flex flex-col justify-center text-white p-8 md:p-8' style={{background:"#1c5a83"}}>
                            <FadeInOnScroll direction="left" delay={600}><h3 className='text-6xl'>We're here to help you</h3></FadeInOnScroll>
                            <FadeInOnScroll direction="right" delay={800}><p className='text-lg mt-4'>Whether you have a question about our document verification services, need technical support, or are looking to explore a partnership — our team is ready to assist you.</p></FadeInOnScroll>
                        </div>
                        <div className='flex flex-col justify-center bg-white p-4 md:p-8'>
                          <form onSubmit={handleSubmit}>
                            <FadeInOnScroll direction="right" delay={800}>
                            {[
                              { label: "Full name*", name: "fullName", placeholder: "Enter your full name" },
                              { label: "Email address*", name: "email", placeholder: "Enter your email address" },
                              { label: "Phone number*", name: "phone", placeholder: "Enter your phone number" },
                              { label: "Company name", name: "company", placeholder: "Enter your company name" },
                              { label: "Subject", name: "subject", placeholder: "Enter your subject" },
                              { label: "Reason for contact", name: "reason", placeholder: "Enter reason for contact" },
                            ].map(({ label, name, placeholder }) => (
                              <div className="inputContainer mb-4" key={name}>
                                <label className="mb-1 block">{label}</label>
                                <input
                                  type="text"
                                  name={name}
                                  placeholder={placeholder}
                                  value={formData[name]}
                                  onChange={handleChange}
                                  className="border w-full border-gray-400 p-2"
                                />
                              </div>
                            ))}

                            <div className="w-full mb-4 px-3">
                              <label className="mb-1 block">Message*</label>
                              <textarea
                                name="message"
                                placeholder="Enter your message"
                                value={formData.message}
                                onChange={handleChange}
                                className="border w-full border-gray-400 p-4 py-2 h-32"
                              />
                            </div>

                            <div className="mt-4 ps-3">
                              <button
                                type="submit"
                                disabled={!isFormValid()}
                                className={`p-4 px-20 font-semibold text-white rounded cursor-pointer transition duration-300 ${
                                  isFormValid()
                                    ? "bg-blue-600 hover:bg-blue-800"
                                    : "bg-gray-400 cursor-not-allowed"
                                }`}
                                style={{
                                  backgroundImage: isFormValid()
                                    ? "linear-gradient(to top, rgb(68, 129, 235) 0%, rgb(4, 190, 254) 100%)"
                                    : "none",
                                }}
                              >
                                Submit
                              </button>
                            </div>
                            </FadeInOnScroll>
                          </form>
                        </div>
                        
                    </div>
                <div className='bg-gray-400 w-full p-4 px-6 text-white grid md:grid-cols-2' style={{backgroundColor:"rgba(0, 0, 0, 0.8)"}}>
                    <div>Copyright &copy; 2025 RVS Doc</div>
                    <div className='md:text-end text-gray-400'>Design & developed by : <a href='https://www.ufsnetworks.com/' className='Link'>Unified Consultancy Services</a></div>
                </div>
                
            </div>
            {showButton && (
      <button
        onClick={scrollToTop}
        style={{
          position: 'fixed',
          bottom: '80px',
          right: '20px',
          padding: '10px 15px',
          fontSize: '24px',
          borderRadius: '32px',
          border: 'none',
          backgroundColor: '#f7f7f7',
          color: '#F00',
          cursor: 'pointer',
          boxShadow: '0 2px 5px rgba(0,0,0,0.3)',
          zIndex: 1000
        }}
      >
        ↑
      </button>
            )}
    </div>
    </div>
  )
}

export default About
