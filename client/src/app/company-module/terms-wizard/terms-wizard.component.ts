import { Component, OnInit } from '@angular/core';
import {UserService} from '../../user.service';
import {User} from '../../Model/user';
import { HttpClient } from '@angular/common/http';
import { DataService } from "../../data.service";
import {NgForm} from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { constants } from "../../../constants/constants";

@Component({
  selector: 'app-terms-wizard',
  templateUrl: './terms-wizard.component.html',
  styleUrls: ['./terms-wizard.component.css']
})
export class TermsWizardComponent implements OnInit {
  info : any;
  currentUser: any;log;
  about_company;
  terms_active_class;about_active_class;
  termscondition;
  marketing_emails;
  agree;
  about_disable;
  terms_id;
  preference;
  pref_active_class;
  pref_disable;
  privacy_id;price_plan_active_class;gdpr_compliance_active_class;pricing_disable
  gdpr_disable;

  constructor(private route: ActivatedRoute,
              private router: Router,
              private authenticationService: UserService,private dataservice: DataService) {
  }


  ngOnInit() {
    this.about_disable= "disabled";
    this.pref_disable = "disabled";
    this.pricing_disable = "disabled";
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));

    this.gdpr_disable = "disabled";
    if(!this.currentUser)
    {
      this.router.navigate(['/login']);
    }
    else if(this.currentUser && this.currentUser.type=='company')
    {
      this.authenticationService.get_page_content('Terms and Condition for company')
      .subscribe(
        data => {
          if(data)
          {
            this.terms_id = data['_id'];
          }
        }
      );

      this.authenticationService.get_page_content('Privacy Notice')
      .subscribe(
        data => {
          if(data)
          {
            this.privacy_id = data['_id'];
          }
        }
      );

      this.authenticationService.getCurrentCompany(this.currentUser._id, false)
        .subscribe(
          data =>
          {
            this.marketing_emails = data['marketing_emails'];
            if(data['terms_id'])
            {
              this.termscondition = true;
              this.marketing_emails = data['marketing_emails'];

              this.about_company = '/about_comp';

            }

            if(data['terms_id'])
            {
              this.about_disable='';
              this.terms_active_class = 'fa fa-check-circle text-success';
              this.about_company = '/about_comp';
            }

            if(data['company_founded'] && data['no_of_employees'] && data['company_funded'] && data['company_description'])
            {
              this.pref_disable = '';
              this.about_active_class = 'fa fa-check-circle text-success';
              this.preference  = '/preferences';

            }
            if(data['job_ids'] && data['job_ids'].length > 0) {
              this.pref_active_class = 'fa fa-check-circle text-success';
            }
            if(data['pricing_plan']) {
              this.pricing_disable = "";
              this.price_plan_active_class = 'fa fa-check-circle text-success';
            }

            if(constants.eu_countries.indexOf(data['company_country']) === -1) {
              if ((data['canadian_commercial_company'] === true || data['canadian_commercial_company'] === false) || (data['usa_privacy_shield'] === true || data['usa_privacy_shield'] === false) || data['dta_doc_link']) {
                this.gdpr_disable = '';
                this.gdpr_compliance_active_class = 'fa fa-check-circle text-success';
              }
            }
          },
          error =>
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
  terms_log;
  terms_wizard(termsForm: NgForm)
  {
    if(this.termscondition!=true)
    {
      this.terms_log = "Please accept terms and condition";
    }
    else
    {
      let queryBody: any = {};
      queryBody.marketing_emails = termsForm.value.marketing;
      queryBody.terms_id = this.terms_id;

      this.authenticationService.account_settings(queryBody)
        .subscribe(
          data => {
            if(data && this.currentUser)
            {
              this.router.navigate(['/about_comp']);
            }
          },
          error => {
            if(error['status'] === 404 && error['error']['message'] && error['error']['requestID'] && error['error']['success'] === false) {
              this.log = error['error']['message'];
            }
            else if(error['status'] === 400 && error['error']['message'] && error['error']['requestID'] && error['error']['success'] === false) {
              this.log = error['error']['message'];
            }
            else {
              this.log = "Something went wrong";
            }
        }
      );
    }
  }

}
