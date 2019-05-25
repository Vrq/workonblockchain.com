import { Component, OnInit, Input, ViewChild } from '@angular/core';
import {LocationsComponent} from '../locations/locations.component';
import { RoleComponent} from '../role/role.component';
import { checkNumber } from '../../../../services/object';
import { constants } from '../../../../constants/constants';

@Component({
  selector: 'app-i-forme-contractor',
  templateUrl: './contractor.component.html',
  styleUrls: ['./contractor.component.css']
})
export class ContractorComponent implements OnInit {
  @Input() contractor: any = {};
  currencies = constants.currencies;
  contractor_types = constants.contractorTypes;
  @ViewChild(LocationsComponent) locationComp: LocationsComponent;
  @ViewChild(RoleComponent) role: RoleComponent;
  location;
  roles;
  hourly_rate;
  currency;
  max_hour_per_week;
  max_hours = [];
  descErrMsg;
  currencyErrMsg;
  hourlyErrMsg;
  typeErrMsg;
  agencyCheck;
  agencyErrMsg;

  constructor() {
  }

  ngOnInit() {
    for(let i =5; i<=60; i=i+5) {
      this.max_hours.push(i);
    }
  }

  selfValidate() {
    const locValid = this.locationComp.selfValidate()
    const roleValid = this.role.selfValidate();
    const descValid = this.descValidation();
    const hourlyValid = this.hourlyValidate();
    const currencyValid = this.currencyValidate();
    const typeValid = this.typeValidate();
    const webValid = this.websiteValidate();
    if(locValid && roleValid && descValid && hourlyValid && currencyValid && typeValid && webValid) {
      return true;
    }
    else return false;
  }

  descValidation() {
    if(!this.contractor['service_description']) {
      this.descErrMsg = 'Please enter service description';
      return false;
    }
    delete this.descErrMsg;
    return true;
  }

  currencyValidate() {
    if(!this.contractor['currency']) {
      this.currencyErrMsg = 'Please select currency';
      return false;
    }
    delete this.currencyErrMsg;
    return true;
  }

  hourlyValidate() {
    if(!this.contractor['expected_hourly_rate']) {
      this.hourlyErrMsg = 'Please enter hourly rate';
      return false;
    }
    if(this.contractor['expected_hourly_rate']) {
      if(!checkNumber(this.contractor['expected_hourly_rate'])) {
        this.hourlyErrMsg = 'Please enter only digits';
        return false;
      }
    }
    delete this.hourlyErrMsg;
    return true;
  }

  typeValidate() {
    if(!this.contractor['contractor_type']) {
      this.typeErrMsg = 'Please select atleast one contractor type';
      return false;
    }
    if(this.contractor['contractor_type']){
      if(this.contractor['contractor_type'].length === 0) {
        this.typeErrMsg = 'Please select atleast one contractor type';
        return false;
      }
      else {
        if(this.contractor['contractor_type'].find(x => x === 'agency')) {
          this.agencyCheck = true;
        }
        else this.agencyCheck = false;
      }
    }
    delete this.typeErrMsg;
    return true;
  }

  websiteValidate() {
    if(this.agencyCheck) {
      if(!this.contractor['agency_website']) {
        this.agencyErrMsg = 'Please enter agency website';
        return false;
      }
      if(this.contractor['agency_website']) {
        const regex = new RegExp("^(http:\\/\\/www\\.|https:\\/\\/www\\.|http:\\/\\/|https:\\/\\/)?[a-z0-9]+([\\-\\.]{1}[a-z0-9]+)*\\.[a-z]{2,10}(:[0-9]{1,5})?(\\/.*)?$");
        if (!regex.test(this.contractor['agency_website'])) {
          this.agencyErrMsg = 'Enter url in proper format';
          return false;
        }
        delete this.agencyErrMsg;
        return true;
      }
    }
    delete this.agencyErrMsg;
    return true;
  }
}
