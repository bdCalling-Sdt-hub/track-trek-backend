# Database design

[database design](https://lucid.app/lucidchart/1eeec016-f3d1-4ab1-9c95-58dee27f16af/edit?invitationId=inv_98bb3e41-4479-4bec-b8b5-dd211c98fa60&page=0_0#)

2. remove track from booked

<!-- ----------------------------------------------------------------------------------------------- -->

## issues

1. when showing participants of a track slot. do not show expired ones

# Darrens credentials

db_user=mytrackDB
db_pass=E7iFCfwdLk1tBdSY
MONGODB_ATLAS_STRING=mongodb+srv://mytrackDB:E7iFCfwdLk1tBdSY@darren.cnygj.mongodb.net/?retryWrites=true&w=majority&appName=Darren

# show client flow

1. how stripe works.
2. onboarding
3. after onboarding how client can manage if he needs any documents to be added by the vendors
4. if he can send direct payment

Hi Darren,

Yes you can add multiple bank accounts for multiple currencies.

The business can also add multiple bank accounts.

We have done it so that stripe fees are deducted from the business. For example, a user pays $100, admin gets 5%, business gets the rest after stripe deducts all the fees.
