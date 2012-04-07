from . import app, db
from flask import render_template, request, flash, session, g, redirect, url_for
from .models import User, Tab
from forms import LoginForm, CreateAccountForm, SubmitTabForm

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

@app.route('/submit_tab', methods=['GET', 'POST'])
def submit_tab():
    form = SubmitTabForm(request.form)
    tabs = None

    if request.method == 'POST':
        if form.validate():
            if g.user is not None:
                old_tab = g.user.tabs.filter_by(browser_id=form.st_browser_id.data).first()
                if old_tab:
                    old_tab.set_url(form.st_url.data)
                    flash('Updated URL (%s) %s' % (old_tab.browser_id, old_tab.url))
                else:
                    new_tab = Tab(g.user.id, form.st_browser_id.data, form.st_url.data)
                    db.session.add(new_tab)
                    flash('Added URL (%s) %s' % (new_tab.browser_id, new_tab.url))
                db.session.commit()
                return redirect(url_for('submit_tab'))
            else:
                flash(u"Login to submit tabs.", 'error')
        else:
            flash_form_errors(form)

    if g.user is not None:
        tabs = g.user.tabs.all()

    return render_template('submit_tab.html', submit_tab_form=form, tabs=tabs)

@app.route('/delete_tab', methods=['GET'])
def delete_tab():
    browser_id = request.args.get('browser_id')
    if g.user and browser_id:
        tab = g.user.tabs.filter_by(browser_id=browser_id).first()
        if tab:
            db.session.delete(tab)
            db.session.commit()

    return redirect(url_for('submit_tab'))

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
    form = LoginForm()
    return dict(login_form=form)
