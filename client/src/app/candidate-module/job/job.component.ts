import { Component, OnInit,AfterViewInit } from '@angular/core';
import {NgForm} from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import {UserService} from '../../user.service';
import {User} from '../../Model/user';
declare var $:any;

import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-job',
  templateUrl: './job.component.html',
  styleUrls: ['./job.component.css']
})
export class JobComponent implements OnInit,AfterViewInit {

  constructor(private http: HttpClient,private route: ActivatedRoute,private router: Router,private authenticationService: UserService) { }
  info: any = {};
  country ='';
  interest_area='';
  expected_salary='';
  checked_country='';
  selectedValue = [];
  selectedcountry = [];
  expYear=[];
  interest='';
  optionSelected: any;
  jobselected=[];
  position='';
  experience_year='';
  currentUser: User;exp_class;
  log; salary; available;link;class;
  availability_day;availability_year;
  active_class;
  job_active_class;
  exp_active_class;resume_active_class;resume_class;base_currency;
  about_active_class;
  term_active_class;
  term_link;
  resume_disable;
  exp_disable;
  current_currency;
  current_salary;
  error_msg;
  expected_validation;
  selectedValueArray=[];
  countriesModel;
  error;
  selectedLocations;
  cities;
  country_log;
  roles_log;
  currency_log;
  salary_log;
  interest_log;
  avail_log;
  current_sal_log;
  current_currency_log;
  count;
  emptyInput;
  validatedLocation=[];
  country_input_log;
  position_type = ['Full time', 'Part time'];
  employment_type_log;
  employment_location_log;
  employee_roles_log;
  work_type_log;
  selected_work_type=[];
  employeeCheck=false;
  contractorCheck=false;
  volunteerCheck=false;
  employee: any = {};
  contractor: any = {};
  volunteer: any = {};
  contractor_currency_log;
  contractor_roles_log;
  contractor_hourly_log;
  agency_website_log;
  contractor_type_log;
  contract_location_log;
  volunteer_location_log;
  volunteer_roles_log;
  objective_log;
  max_hours=[];

  ngAfterViewInit(): void
  {
    window.scrollTo(0, 0);
    setTimeout(() => {
      $('.selectpicker').selectpicker();
    }, 200);
  }
  ngOnInit()
  {
    this.resume_disable = "disabled";
    this.exp_disable = "disabled";
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    for(let i =5; i<=60; i=i+5) {
      this.max_hours.push(i);
    }

    if(!this.currentUser)
    {
      this.router.navigate(['/signup']);
    }
    if(this.currentUser && this.currentUser.type === 'candidate')
    {

      this.roles.sort(function(a, b){
        if(a.name < b.name) { return -1; }
        if(a.name > b.name) { return 1; }
        return 0;
      })


      this.class="btn disabled";
      this.exp_class="btn disabled";
      this.authenticationService.getById(this.currentUser._id)
        .subscribe(
          data => {
              console.log(data);
          },
          error => {
            if(error['message'] === 500 || error['message'] === 401)
            {
              localStorage.setItem('jwt_not_found', 'Jwt token not found');
              localStorage.removeItem('currentUser');
              localStorage.removeItem('googleUser');
              localStorage.removeItem('close_notify');
              localStorage.removeItem('linkedinUser');
              localStorage.removeItem('admin_log');
              window.location.href = '/login';
            }

            if(error['message'] === 403)
            {
              this.router.navigate(['/not_found']);
            }

          });
    }
    else
    {
      this.router.navigate(['/not_found']);
    }


  }

  currency= [
      "£ GBP" ,"€ EUR" , "$ USD"
    ]

  roles = [
      {name:'Backend Developer', value:'Backend Developer', checked:false},
      {name:'Frontend Developer', value:'Frontend Developer', checked:false},
      {name:'UI Developer', value:'UI Developer', checked:false},
      {name:'UX Designer', value:'UX Designer', checked:false},
      {name:'Fullstack Developer', value:'Fullstack Developer', checked:false},
      {name:'Blockchain Developer', value:'Blockchain Developer', checked:false},
      {name:'Smart Contract Developer', value:'Smart Contract Developer', checked:false},
      {name:'Architect', value:'Architect', checked:false},
      {name:'DevOps', value:'DevOps', checked:false},
      {name:'Software Tester', value:'Software Tester', checked:false},
      {name:'CTO', value:'CTO', checked:false},
      {name:'Technical Lead', value:'Technical Lead', checked:false},
      {name:'Product Manager', value:'Product Manager', checked:false},
      {name:'Intern Developer', value:'Intern Developer', checked:false},
      {name:'Researcher', value:'Researcher', checked:false},
      {name:'Mobile app developer', value:'Mobile app developer', checked:false},
      {name:'Data scientist', value:'Data scientist', checked:false},
      {name:'Security specialist ', value:'Security specialist', checked:false},
    ]

  employement_availability = [
    {name: "Now" , value: "Now" },
    {name: "1 month notice period" , value: "1 month" },
    {name: "2 months notice period", value: "2 months" },
    {name: "3 months notice period", value: "3 months" },
    {name: "3+ months notice period", value: "Longer than 3 months" }
  ]

  contractor_types = [
    {name: "I work by myself as a freelancer", value: "freelance",checked:false},
    {name: "I worked through a development agency with a team", value: "agency", checked:false}
  ]

  onJobSelected(e, type) {
    console.log(type);
    if(type === 'employee') {
      if(this.employee.roles) this.jobselected = this.employee.roles;
    }
    if(type === 'contractor') {
      if(this.contractor.roles) this.jobselected = this.contractor.roles;

    }
    if(type === 'volunteer') {
      if(this.volunteer.roles) this.jobselected = this.volunteer.roles;

    }
    if(e.target.checked) {
      this.jobselected.push(e.target.value);
    }
    else {
      let updateItem = this.jobselected.find(this.findIndexToUpdate, e.target.value);
      let index = this.jobselected.indexOf(updateItem);
      this.jobselected.splice(index, 1);
    }
    if(type === 'employee') {
      this.employee.roles=  this.jobselected;
    }
    if(type === 'contractor') {
      this.contractor.roles=  this.jobselected;
    }
    if(type === 'volunteer') {
      this.volunteer.roles=  this.jobselected;
    }

  }

  findIndexToUpdate(type) {
    return type == this;
  }

  onExperienceChange(event) {
    this.experience_year=event.target.value;
    this.expYear.push(event.target.value);
  }

  checkValidation(value) {
      if(value.filter(i => i.visa_needed === true).length === value.length) return true;
      else return false;
  }

  contract_type= [];
  contractor_type(inputParam) {
    console.log(inputParam);
    if(inputParam.target.checked) {
      this.contract_type.push(inputParam.target.value);
    }
    else {
      let updateItem = this.contract_type.find(this.findIndexToUpdate, inputParam.target.value);
      let index = this.contract_type.indexOf(updateItem);
      this.contract_type.splice(index, 1);
    }
    this.contractor.contractor_type = this.contract_type;
  }

  checkContractValue(array) {
    if(array && array.indexOf('agency') === 0) return true;
    else return false;
  }

  onSubmit(f: NgForm) {

    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.error_msg = "";
    this.count = 0;

    let employeeCount = 0;
    let contractorCount = 0;
    let volunteerCount = 0;
    let inputQuery: any = {};
    if(this.employeeCheck === false && this.contractorCheck === false && this.volunteerCheck === false) {
      this.work_type_log = "Please select at least one work type";
    }
    if(this.employeeCheck) {
      if(!this.employee.employment_type) {
        console.log("1");
        this.employment_type_log = "Please choose position type";
        employeeCount = 1;
      }

      if(!this.employee.selectedLocation || (this.employee.selectedLocation && this.employee.selectedLocation.length <= 0) ) {

        console.log("2");
        this.employment_location_log = "Please select at least one location which you can work in without needing a visa";
        employeeCount = 1;
      }
      if(this.employee.selectedLocation && this.employee.selectedLocation.length > 0) {
        if(this.employee.selectedLocation.filter(i => i.visa_needed === true).length === this.employee.selectedLocation.length) {
          console.log("3");
          this.employment_location_log = "Please select at least one location which you can work in without needing a visa";
          employeeCount = 1;
        }
        this.validatedLocation = [];
        for(let location of this.employee.selectedLocation) {
          if(location.name.includes('city')) {
            this.validatedLocation.push({city: location._id, visa_needed : location.visa_needed });
          }
          if(location.name.includes('country')) {
            this.validatedLocation.push({country: location.name.split(" (")[0], visa_needed : location.visa_needed });
          }
          if(location.name === 'Remote') {
            this.validatedLocation.push({remote: true, visa_needed : location.visa_needed });
          }
        }
        this.employee.locations = this.validatedLocation;
      }

      if(this.employee.selectedLocation && this.employee.selectedLocation.length > 10) {
        console.log("4")
        this.employment_location_log = "Please select maximum 10 locations";
        employeeCount = 1;
      }

      if(!this.employee.roles) {
        console.log("5")
        this.employee_roles_log = "Please select minimum one role";
        employeeCount = 1;
       }

       if(!this.employee.expected_annual_salary) {
         console.log("6")
         this.salary_log = "Please enter expected yearly salary";
         employeeCount = 1;
       }
      if(!this.employee.currency) {
        console.log("7")
        this.currency_log = "Please choose currency";
        employeeCount = 1;
      }
      if(!this.employee.employment_availability) {
        console.log("8")
        this.avail_log = "Please select employment availability";
        employeeCount = 1;
      }
    }

    if(this.contractorCheck) {

      if(!this.contractor.selectedLocation || (this.contractor.selectedLocation && this.contractor.selectedLocation.length <= 0) ) {
        this.contract_location_log = "Please select at least one location which you can work in without needing a visa";
        contractorCount = 1;
      }
      if(this.contractor.selectedLocation && this.contractor.selectedLocation.length > 0) {
        if(this.contractor.selectedLocation.filter(i => i.visa_needed === true).length === this.contractor.selectedLocation.length) {
          contractorCount = 1;
          this.contract_location_log = "Please select at least one location which you can work in without needing a visa";
        }
        this.validatedLocation=[];
        for(let location of this.contractor.selectedLocation) {
          if(location.name.includes('city')) {
            this.validatedLocation.push({city: location._id, visa_needed : location.visa_needed });
          }
          if(location.name.includes('country')) {
            this.validatedLocation.push({country: location.name.split(" (")[0], visa_needed : location.visa_needed });
          }
          if(location.name === 'Remote') {
            this.validatedLocation.push({remote: true, visa_needed : location.visa_needed });
          }

        }
        this.contractor.locations = this.validatedLocation;
      }

      if(this.contractor.selectedLocation && this.contractor.selectedLocation.length > 10) {
        this.contract_location_log = "Please select maximum 10 locations";
        contractorCount = 1;
      }

      if(!this.contractor.roles) {
        this.contractor_roles_log = "Please select minimum one role";
        contractorCount = 1;
      }

      if(!this.contractor.hourly_rate) {
        this.contractor_hourly_log = "Please enter hourly rate";
        contractorCount = 1;
      }
      if(!this.contractor.currency) {
        this.contractor_currency_log = "Please choose currency";
        contractorCount = 1;
      }
      if(!this.contractor.contractor_type) {
        this.contractor_type_log = "Please select minimum one contractor type";
        contractorCount = 1;
      }
      if(this.checkContractValue(this.contractor.contractor_type) && !this.contractor.agency_website) {
        this.agency_website_log = "Please enter agency website";
        contractorCount = 1;
      }
    }

    if(this.volunteerCheck) {

      if(!this.volunteer.selectedLocation || (this.volunteer.selectedLocation && this.volunteer.selectedLocation.length <= 0) ) {
        this.volunteer_location_log = "Please select at least one location which you can work in without needing a visa";
        volunteerCount = 1;
      }
      if(this.volunteer.selectedLocation && this.volunteer.selectedLocation.length > 0) {
        console.log(this.volunteer.selectedLocation);
        console.log(this.volunteer.selectedLocation.filter(i => i.visa_needed === true).length);
        if(this.volunteer.selectedLocation.filter(i => i.visa_needed === true).length === this.volunteer.selectedLocation.length) {
          volunteerCount = 1;
          this.volunteer_location_log = "Please select at least one location which you can work in without needing a visa";
        }
        this.validatedLocation=[];
        for(let location of this.volunteer.selectedLocation) {
          if(location.name.includes('city')) {
            this.validatedLocation.push({city: location._id, visa_needed : location.visa_needed });
          }
          if(location.name.includes('country')) {
            this.validatedLocation.push({country: location.name.split(" (")[0], visa_needed : location.visa_needed });
          }
          if(location.name === 'Remote') {
            this.validatedLocation.push({remote: true, visa_needed : location.visa_needed });
          }

        }
        this.volunteer.locations = this.validatedLocation;
      }
     if(!this.volunteer.roles || (this.volunteer.roles && this.volunteer.roles.length<=0)) {
        this.volunteer_roles_log = "Please select minimum one role";
       volunteerCount=1;
     }
     if(!this.volunteer.learning_objectives) {
        this.objective_log = "Please enter learning objectives";
       volunteerCount=1;
     }
    }


    if(this.current_salary && !this.current_currency ) {
      this.current_currency_log = "Please choose currency";
      this.count++;
    }

    if(this.current_salary && this.current_currency === "-1" ) {
      this.current_currency_log = "Please choose currency";
      this.count++;
    }

    if(!this.current_salary && this.current_currency !== "-1") {
      this.current_sal_log = "Please enter current base salary";
      this.count++;
    }
    if((!this.current_salary && !this.current_currency) || (!this.current_salary && this.current_currency === "-1")){
      this.count = 0;
    }
    console.log((this.employeeCheck || this.contractorCheck || this.volunteerCheck));
    console.log(this.count);
    console.log(employeeCount);
    console.log(contractorCount);
    console.log(volunteerCount);
    if( this.count === 0 && (this.employeeCheck || this.contractorCheck || this.volunteerCheck)
    && employeeCount === 0 && contractorCount === 0 && volunteerCount === 0)
    {
      if(this.employeeCheck) {
        inputQuery.employee = {
          employment_type : this.employee.employment_type,
          expected_annual_salary: parseInt(this.employee.expected_annual_salary),
          currency: this.employee.currency,
          location: this.employee.selectedLocation,
          roles: this.employee.roles,
          employment_availability: this.employee.employment_availability
        }
      }


      if(this.contractorCheck) {
        inputQuery.contractor = {
          expected_hourly_rate : parseInt(this.contractor.hourly_rate),
          currency: this.contractor.currency,
          location: this.contractor.selectedLocation,
          roles: this.contractor.roles,
          contractor_type: this.contractor.contractor_type,
          service_description : this.contractor.service_description
        }
        if(this.contractor.agency_website) inputQuery.contractor.agency_website = this.contractor.agency_website;
        if(this.contractor.max_hour_per_week) inputQuery.max_hour_per_week = parseInt(this.contractor.max_hour_per_week);
      }

      if(this.volunteerCheck) {
        inputQuery.volunteer = {
          location: this.volunteer.selectedLocation,
          roles: this.volunteer.roles,
          max_hours_per_week: parseInt(this.volunteer.max_hours_per_week),
          learning_objectives : this.volunteer.learning_objectives
        }
      }

      if(this.current_salary) inputQuery.current_salary = parseInt(this.current_salary);
      if(this.current_currency) inputQuery.current_currency = this.current_currency;

      console.log(inputQuery);

      this.authenticationService.edit_candidate_profile(this.currentUser._creator , inputQuery, false)
        .subscribe(
          data => {
            if (data) {
              console.log(data);
              this.router.navigate(['/candidate_profile']);
            }
          },
          error => {
            if (error['status'] === 401 && error['error']['message'] === 'Jwt token not found' && error['error']['requestID'] && error['error']['success'] === false) {
              localStorage.setItem('jwt_not_found', 'Jwt token not found');
              localStorage.removeItem('currentUser');
              localStorage.removeItem('googleUser');
              localStorage.removeItem('close_notify');
              localStorage.removeItem('linkedinUser');
              localStorage.removeItem('admin_log');
              window.location.href = '/login';
            }
          }
        );


    }
    else{
      this.error_msg = "One or more fields need to be completed. Please scroll up to see which ones.";
    }
  }

  suggestedOptions(inputParam) {
    console.log(inputParam);
    if(inputParam !== '') {
      this.error='';
      this.authenticationService.autoSuggestOptions(inputParam , true)
        .subscribe(
          data => {
            if(data) {
              let citiesInput = data;
              let citiesOptions=[];
              for(let cities of citiesInput['locations']) {
                if(cities['remote'] === true) {
                  citiesOptions.push({_id:Math.floor((Math.random() * 100000) + 1), name: 'Remote'});
                }
                if(cities['city']) {
                  let cityString = cities['city'].city + ", " + cities['city'].country + " (city)";
                  citiesOptions.push({_id : cities['city']._id , name : cityString});
                }
                if(cities['country'] ) {
                  let countryString = cities['country']  + " (country)";
                  if(citiesOptions.findIndex((obj => obj.name === countryString)) === -1)
                    citiesOptions.push({_id:Math.floor((Math.random() * 100000) + 1), name: countryString});
                }
              }
               this.cities = this.filter_array(citiesOptions);

            }

          },
          error=>
          {
            if(error['message'] === 500 || error['message'] === 401)
            {
              localStorage.setItem('jwt_not_found', 'Jwt token not found');
              localStorage.removeItem('currentUser');
              localStorage.removeItem('googleUser');
              localStorage.removeItem('close_notify');
              localStorage.removeItem('linkedinUser');
              localStorage.removeItem('admin_log');
              window.location.href = '/login';
            }

            if(error.message === 403)
            {
              this.router.navigate(['/not_found']);
            }

          });
    }
    return this.cities;
  }


  updateCitiesOptions(input, check,array) {
    let objIndex = array.findIndex((obj => obj.name === input));
    array[objIndex].visa_needed = check;
    return array;

  }

  deleteLocationRow(array, index){
    array.splice(index, 1);
  }

  filter_array(arr) {
    var hashTable = {};

    return arr.filter(function (el) {
      var key = JSON.stringify(el);
      var match = Boolean(hashTable[key]);

      return (match ? false : hashTable[key] = true);
    });
  }


  workTypeChange(event) {

    setTimeout(() => {
      $('.selectpicker').selectpicker('refresh');
    }, 300);
    if(event.target.checked)
    {
      this.selected_work_type.push(event.target.value);
    }
    else{
      let updateItem = this.selected_work_type.find(this.findIndexToUpdate, event.target.value);
      let index = this.selected_work_type.indexOf(updateItem);
      this.selected_work_type.splice(index, 1);
    }

    if(this.selected_work_type.indexOf('employee') > -1) this.employeeCheck = true;
    else this.employeeCheck = false;
    if(this.selected_work_type.indexOf('contractor') > -1) this.contractorCheck = true;
    else this.contractorCheck = false;
    if(this.selected_work_type.indexOf('volunteer') > -1) this.volunteerCheck = true;
    else this.volunteerCheck = false;
  }


  employeeSelectedValueFunction(e) {
    if(this.cities) {
      if(this.cities.find(x => x.name === e)) {
        var value2send=document.querySelector("#countryList option[value='"+this.employee.country+"']")['dataset'].value;

        this.employee.country = '';
        this.cities = [];
        if(this.selectedValueArray.length > 9) {
          this.error = 'You can select maximum 10 locations';
          setInterval(() => {
            this.error = "" ;
          }, 5000);
        }
        else {
          if(this.selectedValueArray.find(x => x.name === e)) {
            this.error = 'This location has already been selected';
            setInterval(() => {
              this.error = "" ;
            }, 4000);
          }

          else {
            if(value2send) this.selectedValueArray.push({_id:value2send ,  name: e, visa_needed:false});
            else this.selectedValueArray.push({ name: e, visa_needed:false});
          }


        }


      }
      if(this.selectedValueArray.length > 0) {
        this.selectedValueArray.sort(function(a, b){
          if(a.name < b.name) { return -1; }
          if(a.name > b.name) { return 1; }
          return 0;
        })
        if(this.selectedValueArray.find((obj => obj.name === 'Remote'))) {
          let remoteValue = this.selectedValueArray.find((obj => obj.name === 'Remote'));
          this.selectedValueArray.splice(0, 0, remoteValue);
          this.selectedValueArray = this.filter_array(this.selectedValueArray);

        }
        this.employee.selectedLocation = this.selectedValueArray;
      }
    }

  }


  employeeUpdateCitiesOptions(event) {
    this.updateCitiesOptions(event.target.value ,event.target.checked, this.employee.selectedLocation );

  }
  employeeDeleteLocationRow(index){
    this.deleteLocationRow(this.employee.selectedLocation, index);
  }

  contractorArray = [];
  contractorSelectedValueFunction(e) {
    if(this.cities) {
      if(this.cities.find(x => x.name === e)) {
        var value2send=document.querySelector("#countryList option[value='"+this.contractor.country+"']")['dataset'].value;

        this.contractor.country = '';
        this.cities = [];
        if(this.contractorArray.length > 9) {
          this.error = 'You can select maximum 10 locations';
          setInterval(() => {
            this.error = "" ;
          }, 5000);
        }
        else {
          if(this.contractorArray.find(x => x.name === e)) {
            this.error = 'This location has already been selected';
            setInterval(() => {
              this.error = "" ;
            }, 4000);
          }

          else {
            if(value2send) this.contractorArray.push({_id:value2send ,  name: e, visa_needed:false});
            else this.contractorArray.push({ name: e, visa_needed:false});
          }


        }


      }
      if(this.contractorArray.length > 0) {
        this.contractorArray.sort(function(a, b){
          if(a.name < b.name) { return -1; }
          if(a.name > b.name) { return 1; }
          return 0;
        })
        if(this.contractorArray.find((obj => obj.name === 'Remote'))) {
          let remoteValue = this.contractorArray.find((obj => obj.name === 'Remote'));
          this.contractorArray.splice(0, 0, remoteValue);
          this.contractorArray = this.filter_array(this.contractorArray);

        }
        this.contractor.selectedLocation = this.contractorArray;
      }
    }

  }
  contractorUpdateCitiesOptions(event) {
    this.updateCitiesOptions(event.target.value ,event.target.checked, this.contractor.selectedLocation );

  }
  contractorDeleteLocationRow(index){
    this.deleteLocationRow(this.contractor.selectedLocation, index);
  }


  volunteerArray = [];
  volunteerSelectedValueFunction(e) {
    if(this.cities) {
      if(this.cities.find(x => x.name === e)) {
        var value2send=document.querySelector("#countryList option[value='"+this.volunteer.country+"']")['dataset'].value;

        this.volunteer.country = '';
        this.cities = [];
        if(this.volunteerArray.length > 9) {
          this.error = 'You can select maximum 10 locations';
          setInterval(() => {
            this.error = "" ;
          }, 5000);
        }
        else {
          if(this.volunteerArray.find(x => x.name === e)) {
            this.error = 'This location has already been selected';
            setInterval(() => {
              this.error = "" ;
            }, 4000);
          }

          else {
            if(value2send) this.volunteerArray.push({_id:value2send ,  name: e, visa_needed:false});
            else this.volunteerArray.push({ name: e, visa_needed:false});
          }


        }


      }
      if(this.volunteerArray.length > 0) {
        this.volunteerArray.sort(function(a, b){
          if(a.name < b.name) { return -1; }
          if(a.name > b.name) { return 1; }
          return 0;
        })
        if(this.volunteerArray.find((obj => obj.name === 'Remote'))) {
          let remoteValue = this.volunteerArray.find((obj => obj.name === 'Remote'));
          this.volunteerArray.splice(0, 0, remoteValue);
          this.volunteerArray = this.filter_array(this.volunteerArray);

        }
        this.volunteer.selectedLocation = this.volunteerArray;
      }
    }

  }
  volunteerUpdateCitiesOptions(event) {
    this.updateCitiesOptions(event.target.value ,event.target.checked, this.volunteer.selectedLocation );

  }
  volunteerDeleteLocationRow(index){
    this.deleteLocationRow(this.volunteer.selectedLocation, index);
  }
}

