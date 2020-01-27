FROM gitpod/workspace-full:latest

# Create some bash aliases for the maven archetypes of enRoute and resolving/indexing
USER gitpod
RUN wget http://apache.cs.utah.edu/sling/org.apache.sling.starter-11.jar -O /home/gitpod/org.apache.sling.starter-11.jar

# Give back control
USER root