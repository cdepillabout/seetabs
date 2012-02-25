from . import app, db
from flask import render_template, request, flash, session, g, redirect, url_for
from .models import User
from forms import LoginForm, CreateAccountForm

@app.before_request
def lookup_current_user():
    g.user = None
    if 'user_id' in session:
        g.user = User.query.filter_by(id=session['user_id']).first()

def flash_form_errors(form):
    for field, errors in form.errors.items():
        for error in errors:
            flash(u"Error in the %s field: %s" % (getattr(form, field).label.text, error),
                    'error')

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/login', methods=['POST'])
def login():

    form = LoginForm(request.form)

    if g.user is not None:
        # log out old user?
        # redirect to next
        pass

    if form.validate_on_submit():
        flash('Logged In')
        session['user_id'] = form.user.id
    else:
        flash_form_errors(form)
    return form.redirect_next('index')

@app.route('/create_account', methods=['GET', 'POST'])
def create_account():
    #if g.user is not None or 'user_id' not in session:
    #    return redirect(url_for('index'))
    form = CreateAccountForm(request.form)
    if request.method == 'POST':
        if form.validate():
            user = User.query.filter_by(username=form.ca_username.data).first()
            if user is None:
                new_user = User(form.ca_username.data,
                        form.ca_email.data, form.ca_password.data)
                db.session.add(new_user)
                db.session.commit()
                flash('Account Created')
                session['user_id'] = new_user.id
                return redirect(url_for('index'))
            else:
                flash(u"Username can not be used.", 'error')
        else:
            flash_form_errors(form)

    return render_template('create_account.html', create_account_form=form)

def redirect_url():
    return request.args.get('next') or \
           request.referrer or \
           url_for('index')

@app.route('/logout')
def logout():
    # TODO: pass 'next' arg to logout url so we know where to go next
    g.user = None
    session.pop('user_id', None)
    flash(u'You were signed out')
    return redirect(redirect_url())


@app.context_processor
def inject_login_form():
    return dict(login_form=LoginForm())
