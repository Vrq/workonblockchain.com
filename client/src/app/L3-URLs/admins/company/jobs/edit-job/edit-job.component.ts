import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import {UserService} from '../../../../../user.service';

@Component({
  selector: 'app-u-admin-company-edit-job',
  templateUrl: './edit-job.component.html',
  styleUrls: ['./edit-job.component.css']
})
export class EditJobComponent implements OnInit {
  company_id;job_id;currentUser;jobDoc;admin_log;error;

  constructor(private route: ActivatedRoute,private authenticationService: UserService,private router: Router) {
    this.route.params.subscribe(params => {
      this.company_id = params['company_id'];
      this.job_id = params['job_id'];
    });
  }

  ngOnInit() {
    console.log('admin edit job page');
    console.log(this.company_id);
    console.log(this.job_id);
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.admin_log = JSON.parse(localStorage.getItem('admin_log'));
    console.log(this.currentUser);

    if(this.currentUser) {
      if (this.job_id && this.company_id && this.admin_log.is_admin === 1 && this.currentUser) {
        this.authenticationService.getAJob(this.job_id, this.company_id, true)
          .subscribe(
            data =>{
              this.jobDoc = data;
              console.log(this.jobDoc);
            },
            error => {
              if(error['status'] === 404 && error['error']['message'] && error['error']['requestID'] && error['error']['success'] === false)
                console.log(error['error']['message']);
            }
          );
      }
      else this.router.navigate(['/not-found']);
    }
    else this.router.navigate(['/login']);
  }

}
